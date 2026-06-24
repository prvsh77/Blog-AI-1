import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
} from '../controllers/userController.js';
import { userProtect } from '../middleware/userAuthMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        // Create a unique filename to avoid conflicts
        return cb(null, `avatar_${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', userProtect, getUserProfile);
router.put('/profile', userProtect, upload.single('avatar'), updateUserProfile);

export default router;