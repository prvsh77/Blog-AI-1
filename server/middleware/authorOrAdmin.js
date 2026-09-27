import Blog from '../models/Blog.js';
import { getAdminEmail } from './auth.js';
import { getUserFromToken } from './userAuthMiddleware.js';

// Accepts EITHER an admin token OR a user token that owns the post.
// The two token types are checked separately and never merged: admin tokens
// carry { email }, user tokens carry { id }, so neither can pass the other's check.
// Sets req.admin or req.user, plus req.blog so handlers don't re-fetch.
const authorOrAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ success: false, message: 'No authentication token provided' });
        }

        const adminEmail = getAdminEmail(authHeader);
        const user = adminEmail ? null : await getUserFromToken(authHeader);
        if (!adminEmail && !user) {
            return res.json({ success: false, message: 'Invalid or expired token' });
        }

        const blogId = req.params.id ?? req.params.blogId ?? req.body?.id ?? req.body?.blogId;
        let blog = null;
        try {
            if (blogId) blog = await Blog.findById(blogId);
        } catch {
            // CastError for a malformed ObjectId: treat as not found
        }
        if (!blog) {
            return res.json({ success: false, message: 'Blog not found' });
        }

        if (!adminEmail && (!blog.author || String(blog.author) !== String(user._id))) {
            return res.json({ success: false, message: 'You can only modify your own posts' });
        }

        if (adminEmail) req.admin = { email: adminEmail };
        else req.user = user;
        req.blog = blog;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export default authorOrAdmin;
