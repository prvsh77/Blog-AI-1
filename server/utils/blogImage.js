import fs from 'fs';
import imagekit from '../configs/imageKit.js';

// Default high-quality stock image fallback based on category
const CATEGORY_IMAGES = {
    Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80',
    Startups: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1280&q=80',
    Lifestyle: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1280&q=80',
    Finance: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1280&q=80'
};

export const stockImageFor = (category) => CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Technology;

// Uploaded file -> ImageKit URL when configured, else a copy under /uploads served statically.
export const storeUploadedImage = async (file, req) => {
    if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PRIVATE_KEY.trim() !== '') {
        const response = await imagekit.upload({
            file: fs.readFileSync(file.path),
            fileName: file.originalname,
            folder: "/blogs"
        });
        // optimization through imagekit URL transformation
        return imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'}, // Auto compression
                {format: 'webp'},  // Convert to modern format
                {width: '1280'}    // Width resizing
            ]
        });
    }
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    }
    const localPath = `uploads/${Date.now()}_${file.originalname}`;
    fs.copyFileSync(file.path, localPath);
    return `${req.protocol}://${req.get('host')}/${localPath}`;
};

export const resolveBlogImage = async ({ file, category, req }) =>
    file ? storeUploadedImage(file, req) : stockImageFor(category);
