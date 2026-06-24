import jwt from 'jsonwebtoken'
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import Subscriber from '../models/Subscriber.js';

export const adminLogin = async (req, res)=>{
    try {
        const {email, password} = req.body;

        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key_here";

                console.log("========== LOGIN DEBUG ==========");
        console.log("Entered Email:", email);
        console.log("Entered Password:", password);
        console.log("Admin Email:", adminEmail);
        console.log("Admin Password:", adminPassword);
        console.log("=================================");
        if(email !== adminEmail || password !== adminPassword){
            return res.json({success: false, message: "Invalid Credentials"})
        }

        const token = jwt.sign({email}, jwtSecret)
        res.json({success: true, token})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getAllBlogsAdmin = async (req, res) =>{
    try {
        const blogs = await Blog.find({}).sort({createdAt: -1});
        res.json({success: true, blogs})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getAllComments = async (req, res) =>{
    try {
        const comments = await Comment.find({}).populate("blog").sort({createdAt: -1})
        res.json({success: true, comments})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getDashboard = async (req, res) =>{
    try {
        const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments()
        const drafts = await Blog.countDocuments({isPublished: false})

        const dashboardData = {
            blogs, comments, drafts, recentBlogs
        }
        res.json({success: true, dashboardData})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const deleteCommentById = async (req, res) =>{
    try {
        const {id} = req.body;
        await Comment.findByIdAndDelete(id);
        res.json({success: true, message:"Comment deleted successfully" })
    } catch (error) {
       res.json({success: false, message: error.message}) 
    }
}

export const approveCommentById = async (req, res) =>{
    try {
        const {id} = req.body;
        await Comment.findByIdAndUpdate(id, {isApproved: true});
        res.json({success: true, message:"Comment approved successfully" })
    } catch (error) {
       res.json({success: false, message: error.message}) 
    }
}

export const getAnalytics = async (req, res) => {
    try {
        const blogs = await Blog.find({});
        const totalSubscribers = await Subscriber.countDocuments();
        
        let totalViews = 0;
        const categoryStats = {};

        blogs.forEach(b => {
            totalViews += b.views || 0;
            const cat = b.category || 'Uncategorized';
            if (!categoryStats[cat]) {
                categoryStats[cat] = { count: 0, views: 0 };
            }
            categoryStats[cat].count += 1;
            categoryStats[cat].views += b.views || 0;
        });

        const popularCategories = Object.keys(categoryStats).map(cat => ({
            category: cat,
            count: categoryStats[cat].count,
            views: categoryStats[cat].views
        })).sort((a, b) => b.views - a.views);

        const mostViewedPosts = [...blogs]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        let recentSubscribers = [];
        try {
            recentSubscribers = await Subscriber.find({}).sort({ createdAt: -1 }).limit(5);
        } catch (e) {
            // ignore
        }

        res.json({
            success: true,
            analytics: {
                totalViews,
                totalBlogs: blogs.length,
                popularCategories,
                mostViewedPosts,
                totalSubscribers,
                recentSubscribers
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}