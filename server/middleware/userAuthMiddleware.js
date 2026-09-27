import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const bearerToken = (authHeader) =>
    authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : null;

// Claim-only check, no DB hit. Returns the user id from a valid user token, else null.
// Admin tokens carry { email } and no id, so they resolve to null here.
export const getUserIdFromToken = (authHeader) => {
    const token = bearerToken(authHeader);
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id ? String(decoded.id) : null;
    } catch (error) {
        console.log('Invalid token:', error.message);
        return null;
    }
};

// Full user document (minus password) for a valid user token, else null.
export const getUserFromToken = async (authHeader) => {
    const id = getUserIdFromToken(authHeader);
    if (!id) return null;
    return User.findById(id).select('-password');
};

const userProtect = asyncHandler(async (req, res, next) => {
    if (!bearerToken(req.headers.authorization)) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    const user = await getUserFromToken(req.headers.authorization);
    // Also covers a valid token whose user no longer exists; previously that
    // set req.user = null and let the request through.
    if (!user) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }

    req.user = user;
    next();
});

export { userProtect };
