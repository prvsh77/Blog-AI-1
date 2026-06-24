import express from 'express';
import {
    generateTitle,
    generateOutline,
    generateBlog,
    generateSEO,
    generateFAQ,
    generateImagePrompt,
    rewriteContent,
    analyzeContent
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-title', generateTitle);
router.post('/generate-outline', generateOutline);
router.post('/generate-blog', generateBlog);
router.post('/generate-seo', generateSEO);
router.post('/generate-faq', generateFAQ);
router.post('/generate-image-prompt', generateImagePrompt);
router.post('/rewrite', rewriteContent);
router.post('/analyze', analyzeContent);

export default router;