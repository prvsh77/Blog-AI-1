import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MockUserModel } from '../configs/mockDb.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Do not return password by default on queries
    },
    avatar: {
        type: String,
        default: 'https://i.pravatar.cc/150',
    },
    bio: {
    type: String,
    default: ""
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },

    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
    }],
    readingHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
    }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

// Same fallback shape as Blog/Comment/Subscriber: offline, route every call to the JSON mock.
const UserProxy = new Proxy(User, {
    get(target, prop) {
        if (global.isMockDB) {
            const val = Reflect.get(MockUserModel, prop);
            return typeof val === 'function' ? val.bind(MockUserModel) : val;
        }
        const val = Reflect.get(target, prop);
        return typeof val === 'function' ? val.bind(target) : val;
    }
});

export default UserProxy;