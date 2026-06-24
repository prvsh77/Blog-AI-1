import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/user/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields: name, email, and password.');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists.');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        const token = generateToken(user._id, user.role);
        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data provided.');
    }
});

/**
 * @desc    Authenticate a user
 * @route   POST /api/user/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateToken(user._id, user.role);
        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password.');
    }
});

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is attached by the userProtect middleware
    res.status(200).json(req.user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.file) {
            // Assuming uploads are served statically
            user.avatar = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
        });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

export {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};