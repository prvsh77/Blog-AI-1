import mongoose from "mongoose";
import { MockBlogModel } from '../configs/mockDb.js';

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    subTitle: {type: String},
    description: {type: String, required: true},
    category: {type: String, required: true},
    image: {type: String, required: true},
    // Legacy flag, kept in sync on writes; status/publishAt are the source of truth.
    isPublished: {type: Boolean, default: false},
    // No default: a default would be applied to old documents on load and mask their isPublished value.
    status: {type: String, enum: ['draft', 'pending', 'scheduled', 'published']},
    publishAt: {type: Date},
    // Optional: admin-created posts have no author. authorName is a snapshot so
    // attribution renders without a populate (the mock DB can't populate blogs).
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    authorName: {type: String},
    // Set by the admin when a pending post is sent back to draft.
    reviewNote: {type: String},
    featured: {type: Boolean, default: false},
    tags: {type: [String], default: []},
    views: {type: Number, default: 0},
    readTime: {type: Number, default: 0},
},{timestamps: true});

const Blog = mongoose.model('Blog', blogSchema);

const BlogProxy = new Proxy(Blog, {
    get(target, prop) {
        if (global.isMockDB) {
            const val = Reflect.get(MockBlogModel, prop);
            return typeof val === 'function' ? val.bind(MockBlogModel) : val;
        }
        const val = Reflect.get(target, prop);
        return typeof val === 'function' ? val.bind(target) : val;
    }
});

export default BlogProxy;