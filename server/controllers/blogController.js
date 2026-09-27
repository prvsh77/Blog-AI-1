import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import Subscriber from '../models/Subscriber.js';
import main from '../configs/gemini.js';
import User from '../models/User.js';
import { withReadTime } from '../utils/readingTime.js';
import { buildPublishFields, isPubliclyVisible, resolveStatus, withStatus } from '../utils/publishStatus.js';
import { resolveBlogImage } from '../utils/blogImage.js';
import { getAdminEmail } from '../middleware/auth.js';
import { getUserIdFromToken } from '../middleware/userAuthMiddleware.js';
import { assertPendingCapacity } from '../utils/pendingCap.js';

// Hidden posts (draft/pending/not-yet-due) are viewable by the admin and by the post's own author.
const canView = (blog, req) => {
    if (isPubliclyVisible(blog)) return true;
    const authHeader = req.headers.authorization;
    if (getAdminEmail(authHeader)) return true;
    const userId = getUserIdFromToken(authHeader);
    return Boolean(userId && blog.author && String(blog.author) === userId);
};

export const addBlog = async (req, res)=>{
    try {
        const {title, subTitle, description, category, isPublished, status, publishAt} = JSON.parse(req.body.blog);
        const publishFields = buildPublishFields({ status, publishAt, isPublished });
        // Check if required text fields are present
        if(!title || !description || !category){
            return res.json({success: false, message: "Missing required fields (title, description, or category)" })
        }

        const image = await resolveBlogImage({ file: req.file, category, req });

        await Blog.create({title, subTitle, description, category, image, ...publishFields})

        res.json({success: true, message: "Blog added successfully"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const AUTHOR_STATUSES = ['draft', 'pending'];

// Regular users (userProtect) create posts here. They may save a private draft
// or submit for review; publishing and scheduling are admin actions only.
export const submitBlog = async (req, res) => {
    try {
        if (!req.body?.blog) {
            return res.json({ success: false, message: "Missing blog payload" });
        }
        const { title, subTitle, description, category, status } = JSON.parse(req.body.blog);
        if (!title || !description || !category) {
            return res.json({ success: false, message: "Missing required fields (title, description, or category)" });
        }
        const requested = status || 'pending';
        if (!AUTHOR_STATUSES.includes(requested)) {
            return res.json({ success: false, message: "Authors can save a draft or submit for review; publishing and scheduling are done by the admin." });
        }
        if (requested === 'pending') {
            await assertPendingCapacity(req.user._id);
        }

        const image = await resolveBlogImage({ file: req.file, category, req });
        const blog = await Blog.create({
            title, subTitle, description, category, image,
            author: req.user._id,
            authorName: req.user.name,
            ...buildPublishFields({ status: requested })
        });

        res.json({
            success: true,
            status: requested,
            blogId: blog._id,
            message: requested === 'pending' ? 'Post submitted for review' : 'Draft saved'
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// The signed-in author's own posts, every status, newest first.
export const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, blogs: blogs.map(withStatus) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAllBlogs = async (req, res)=>{
    try {
        // Filtered in JS, not in the query: the mock-DB fallback only supports equality matches.
        const now = new Date();
        const blogs = (await Blog.find({})).filter(b => isPubliclyVisible(b, now))
        res.json({success: true, blogs: blogs.map(withReadTime)})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogById = async (req, res) =>{
    try {
        const { blogId } = req.params;
        let blog = null;

        // Try finding by ID first
        try {
            if (blogId.match(/^[0-9a-fA-F]{24}$/) || blogId.startsWith('blog_')) {
                blog = await Blog.findById(blogId);
            }
        } catch (err) {
            // Ignore cast errors
        }

        // Fallback: search all blogs to match the title slug
        if (!blog) {
            const allBlogs = await Blog.find({});
            blog = allBlogs.find(b => {
                const slug = b.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                return slug === blogId || b._id.toString() === blogId;
            });
        }

        if(!blog || !canView(blog, req)){
            return res.json({ success: false, message: "Blog not found" });
        }
        res.json({success: true, blog: withReadTime(blog)})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// req.blog is set by authorOrAdmin, which has already checked ownership.
export const deleteBlogById = async (req, res) =>{
    try {
        const id = req.blog._id;
        await Blog.findByIdAndDelete(id);

        // Delete all comments associated with the blog
        await Comment.deleteMany({blog: id});

        res.json({success: true, message: 'Blog deleted successfully'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const TOGGLE_MESSAGES = {
    published: 'Blog published',
    draft: 'Blog moved to drafts',
    pending: 'Post submitted for review',
};

// Status transitions, by who is acting (req.blog/req.admin/req.user come from authorOrAdmin):
//   admin:  live -> draft, anything else -> published (unchanged behaviour)
//   author: live -> draft (unpublish), pending -> draft (withdraw), draft -> pending (submit)
// Authors can never set 'published' directly; that is the admin's approval step.
export const togglePublish = async (req, res) =>{
    try {
        const blog = req.blog;
        const live = isPubliclyVisible(blog);
        let nextStatus;
        if (req.admin) {
            nextStatus = live ? 'draft' : 'published';
        } else if (live || resolveStatus(blog) === 'pending') {
            nextStatus = 'draft';
        } else {
            await assertPendingCapacity(req.user._id);
            nextStatus = 'pending';
        }

        const fields = buildPublishFields({ status: nextStatus });
        Object.assign(blog, fields);
        // A resubmission supersedes the note from the previous review.
        if (nextStatus === 'pending') blog.reviewNote = null;
        await blog.save();
        res.json({success: true, status: nextStatus, message: TOGGLE_MESSAGES[nextStatus]})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


export const addComment = async (req, res) =>{
    try {
        const {blog, name, content } = req.body;
        await Comment.create({blog, name, content});
        res.json({success: true, message: 'Comment added for review'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogComments = async (req, res) =>{
    try {
        const {blogId } = req.body;
        const comments = await Comment.find({blog: blogId, isApproved: true}).sort({createdAt: -1});
        res.json({success: true, comments})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const generateContent = async (req, res)=>{
    try {
        const {prompt} = req.body;
        let content = '';
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
            content = await main(prompt + ' Generate a blog content for this topic in simple text format  --Note -> Donot include any such text just give the content')
        } else {
            // Local Mock AI fallback
            content = `<h1>${prompt}</h1>
<p>In today's fast-paced world, "${prompt}" has become a critical topic of discussion. Whether you are an industry professional, a bootstrapping entrepreneur, or simply curious, understanding the core concepts of this subject is essential for staying ahead.</p>
<h2>Key Takeaways</h2>
<ul>
  <li><strong>Innovation:</strong> Adapting to new paradigms and workflows allows for rapid growth.</li>
  <li><strong>Consistency:</strong> Regular execution and small incremental updates yield significant long-term results.</li>
  <li><strong>Quality:</strong> Focusing on value creation builds trust and a loyal community.</li>
</ul>
<p>Ultimately, the key is to stay curious, keep learning, and apply these insights to your daily projects. By embracing these ideas, you will unlock new opportunities for personal and professional growth.</p>`;
        }
        res.json({success: true, content})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getTopics = async (req, res) => {
    try {
        let parsedTopics = [];
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
            const prompt = 'Give me 5 unique blog topics related to technology,startups,lifestyle,Finance. Format each topic with its title and category in this format: "Title" - *Category*. strictly give the topic thats it nothing else. No introduction text nothings just topics.';
            const topics = await main(prompt);
            
            // Parse the topics string into structured data
            parsedTopics = topics.split('\n')
                .filter(line => line.trim())
                .map(topic => {
                    const [title, category] = topic.split(' - ');
                    return {
                        title: title.replace(/^\d+\.\s*\*\*"|"\*\*$/g, ''),
                        category: category?.replace(/^\*|[\*]$/g, '').trim()
                    };
                });
        } else {
            // Local Mock Topics fallback
            parsedTopics = [
                { title: "Building in Public: The New Startup Superpower", category: "Startups" },
                { title: "Why Micro-SaaS is the Best Way to Bootstrap in 2026", category: "Technology" },
                { title: "The Art of Slow Living in a Fast-Paced Digital World", category: "Lifestyle" },
                { title: "Understanding Decentralized Finance (DeFi) in Plain English", category: "Finance" },
                { title: "Maximizing Productivity: Clean Desk, Clear Mind", category: "Lifestyle" }
            ];
        }

        res.json({ success: true, topics: parsedTopics });
    }
    catch(error) {
        res.json({ success: false, message: error.message });
    }
}

export const getRelatedBlogs = async (req, res) => {
    try {
        const { category, exclude } = req.query;
        const allBlogs = await Blog.find({});

        let targetBlog = null;
        if (exclude) {
            targetBlog = allBlogs.find(b => b._id.toString() === exclude);
        }

        const now = new Date();
        let related = allBlogs.filter(b => isPubliclyVisible(b, now));
        if (exclude) {
            related = related.filter(b => b._id.toString() !== exclude);
        }

        if (targetBlog) {
            // Semantic Similarity calculation
            related.forEach(blog => {
                let score = 0;

                // 1. Category matching
                if (blog.category && targetBlog.category && blog.category.trim().toLowerCase() === targetBlog.category.trim().toLowerCase()) {
                    score += 10;
                }

                // 2. Common tags matching
                const tagsA = blog.tags || [];
                const tagsB = targetBlog.tags || [];
                const commonTags = tagsA.filter(t => tagsB.includes(t));
                score += commonTags.length * 5;

                // 3. Title word overlaps
                const wordsA = (blog.title || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
                const wordsB = (targetBlog.title || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
                const commonWords = wordsA.filter(w => wordsB.includes(w));
                score += commonWords.length * 3;

                // 4. Content similarity overlap
                const descA = (blog.description || '').toLowerCase().replace(/<[^>]*>/g, ' ').split(/\W+/).filter(w => w.length > 4).slice(0, 100);
                const descB = (targetBlog.description || '').toLowerCase().replace(/<[^>]*>/g, ' ').split(/\W+/).filter(w => w.length > 4).slice(0, 100);
                const commonDesc = descA.filter(w => descB.includes(w));
                score += commonDesc.length * 0.1;

                blog._score = score;
            });

            related.sort((a, b) => (b._score || 0) - (a._score || 0) || new Date(b.createdAt) - new Date(a.createdAt));
        } else if (category) {
            related = related.filter(b => b.category === category);
        }

        res.json({ success: true, posts: related.slice(0, 3) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const incrementViews = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId);
        if (!blog || !canView(blog, req)) {
            return res.json({ success: false, message: "Blog not found" });
        }
        blog.views = (blog.views || 0) + 1;
        await blog.save();
        res.json({ success: true, views: blog.views });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const askAiAboutArticle = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { question } = req.body;
        const blog = await Blog.findById(blogId);
        if (!blog || !canView(blog, req)) {
            return res.json({ success: false, message: "Blog not found" });
        }
        
        const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '';
        let answer = '';
        
        if (hasApiKey) {
            const cleanText = blog.description.replace(/<[^>]*>/g, ' ');
            const prompt = `You are a helpful AI assistant. Answer the user's question about the following blog post. Do not answer questions outside of this blog post. Use simple formatting, concise sentences, and bullet points if appropriate.
Blog Title: ${blog.title}
Blog Content: ${cleanText}

User Question: ${question}

Response:`;
            answer = await main(prompt);
        } else {
            // Rule-based chat response logic fallback
            const q = question.toLowerCase();
            const cleanText = blog.description.replace(/<[^>]*>/g, ' ');
            const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);

            if (q.includes('summarize') || q.includes('summary')) {
                answer = `Here is a summary of "${blog.title}":\n\nThis article outlines the key parameters of ${blog.title}. It explores modern methodologies, challenges, and core solutions. The main takeaway is to maintain consistent execution and structured learning processes to achieve long-term growth.`;
            } else if (q.includes('quiz')) {
                answer = `Here is a quick quiz to test your understanding of "${blog.title}":\n\n1. What is the primary focus of this article?\n2. What are the key takeaways or lessons learned?\n3. How can you implement this framework in your current project?\n\n(Tip: Browse the headers and key insights to find the answers!)`;
            } else if (q.includes('example') || q.includes('practical')) {
                answer = `Here are some practical examples based on "${blog.title}":\n\n- Pilot Implementation: Apply the core principles in a minor scale before full rollout.\n- Metric Tracking: Log data before and after making standard process updates.\n- Process Audit: Conduct regular retrospectives to optimize bottlenecks.`;
            } else if (q.includes('beginner') || q.includes('explain like a beginner') || q.includes('eli5')) {
                answer = `Here is a simplified explanation of "${blog.title}":\n\nThink of this topic like learning to ride a bike. The article acts as your training wheels. It helps you understand how to balance, breaks down the steps into simple instructions, and guides you forward so you don't fall over!`;
            } else {
                if (sentences.length > 2) {
                    answer = `Based on the article "${blog.title}", here is what was mentioned: "${sentences[0]}. Furthermore, ${sentences[1]}."`;
                } else {
                    answer = `Thank you for asking about "${blog.title}". This article details the strategies, key frameworks, and learnings. Explore the text for more details!`;
                }
            }
        }
        res.json({ success: true, answer });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            return res.json({ success: false, message: "Invalid email address" });
        }
        
        try {
            await Subscriber.create({ email });
            res.json({ success: true, message: "Subscribed successfully!" });
        } catch (err) {
            if (err.message.includes("unique") || err.message.includes("already")) {
                return res.json({ success: false, message: "This email is already subscribed!" });
            }
            throw err;
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
export const getBookmarkedBlogs = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
            .populate('bookmarks');

        const now = new Date();
        res.json({
            success: true,
            blogs: user.bookmarks.filter(b => b && isPubliclyVisible(b, now))
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
};
export const toggleBookmark = async (req, res) => {
    try {

        const { blogId } = req.body;

        const user = await User.findById(req.user._id);

        const alreadyBookmarked =
            user.bookmarks.includes(blogId);

        if (alreadyBookmarked) {

            user.bookmarks =
                user.bookmarks.filter(
                    id => id.toString() !== blogId
                );

        } else {

            user.bookmarks.push(blogId);

        }

        await user.save();

        res.json({
            success: true,
            bookmarks: user.bookmarks
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
};