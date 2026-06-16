import mongoose from "mongoose";
import { MockBlogModel } from '../configs/mockDb.js';

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    subTitle: {type: String},
    description: {type: String, required: true},
    category: {type: String, required: true},
    image: {type: String, required: true},
    isPublished: {type: Boolean, required: true},
},{timestamps: true});

const MongooseBlog = mongoose.model('blog', blogSchema);

const BlogProxy = new Proxy(MongooseBlog, {
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