import fs from 'fs'
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';

export const addBlog = async (req, res)=>{
    try {
        const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog);
        const imageFile = req.file;

        // Check if required text fields are present
        if(!title || !description || !category){
            return res.json({success: false, message: "Missing required fields (title, description, or category)" })
        }

        let image = '';
        if (imageFile) {
            if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PRIVATE_KEY.trim() !== '') {
                const fileBuffer = fs.readFileSync(imageFile.path)

                // Upload Image to ImageKit
                const response = await imagekit.upload({
                    file: fileBuffer,
                    fileName: imageFile.originalname,
                    folder: "/blogs"
                })

                // optimization through imagekit URL transformation
                const optimizedImageUrl = imagekit.url({
                    path: response.filePath,
                    transformation: [
                        {quality: 'auto'}, // Auto compression
                        {format: 'webp'},  // Convert to modern format
                        {width: '1280'}    // Width resizing
                    ]
                });

                image = optimizedImageUrl;
            } else {
                // Local file storage fallback
                if (!fs.existsSync('uploads')) {
                    fs.mkdirSync('uploads');
                }
                const localPath = `uploads/${Date.now()}_${imageFile.originalname}`;
                fs.copyFileSync(imageFile.path, localPath);
                image = `http://localhost:${process.env.PORT || 3000}/${localPath}`;
            }
        } else {
            // Default high-quality stock image fallback based on category
            const categoryImages = {
                Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80',
                Startups: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1280&q=80',
                Lifestyle: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1280&q=80',
                Finance: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1280&q=80'
            };
            image = categoryImages[category] || categoryImages.Technology;
        }

        await Blog.create({title, subTitle, description, category, image, isPublished})

        res.json({success: true, message: "Blog added successfully"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getAllBlogs = async (req, res)=>{
    try {
        const blogs = await Blog.find({isPublished: true})
        res.json({success: true, blogs})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogById = async (req, res) =>{
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId)
        if(!blog){
            return res.json({ success: false, message: "Blog not found" });
        }
        res.json({success: true, blog})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const deleteBlogById = async (req, res) =>{
    try {
        const { id } = req.body;
        await Blog.findByIdAndDelete(id);

        // Delete all comments associated with the blog
        await Comment.deleteMany({blog: id});

        res.json({success: true, message: 'Blog deleted successfully'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const togglePublish = async (req, res) =>{
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({success: true, message: 'Blog status updated'})
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
