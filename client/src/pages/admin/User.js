import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
        select: false, // Do not return password by default
    },
    avatar: {
        type: String,
        default: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
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

const User = mongoose.model('User', userSchema);

export default User;