import mongoose from "mongoose";
import { MockCommentModel } from '../configs/mockDb.js';

const commentSchema = new mongoose.Schema({
    blog: {type: mongoose.Schema.Types.ObjectId, ref: 'blog', required: true},
    name:  { type: String, required: true },
    content: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
},{timestamps: true});

const MongooseComment = mongoose.model('Comment', commentSchema);

const CommentProxy = new Proxy(MongooseComment, {
    get(target, prop) {
        if (global.isMockDB) {
            const val = Reflect.get(MockCommentModel, prop);
            return typeof val === 'function' ? val.bind(MockCommentModel) : val;
        }
        const val = Reflect.get(target, prop);
        return typeof val === 'function' ? val.bind(target) : val;
    }
});

export default CommentProxy;