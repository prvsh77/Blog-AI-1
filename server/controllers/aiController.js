import { GoogleGenerativeAI } from "@google/generative-ai";
import asyncHandler from 'express-async-handler';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const generateContent = async (prompt) => {
    if (!genAI) {
        // Fallback for when API key is not set
        return `This is fallback content for the prompt: "${prompt}". Please set your GEMINI_API_KEY in the .env file to use the AI generation feature.`;
    }
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

const generateTitle = asyncHandler(async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        res.status(400);
        throw new Error('Please provide a topic');
    }

    if (!genAI) {
        const fallbackTitles = Array.from({ length: 10 }, (_, i) => ({ title: `Fallback Title ${i + 1} for ${topic}` }));
        return res.status(200).json(fallbackTitles);
    }

    const prompt = `Generate 10 engaging and SEO-friendly blog post titles about "${topic}". Return the response as a JSON array of objects, where each object has a "title" key. For example: [{"title": "Your Title Here"}].`;
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '');
        const titles = JSON.parse(text);
        res.status(200).json(titles);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate titles from AI", error: error.message });
    }
});

const generateOutline = asyncHandler(async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        res.status(400);
        throw new Error('Please provide a topic');
    }
    const prompt = `Create a blog post outline for the topic "${topic}". The outline should be structured in JSON format with a main key "outline" which is an array of objects. Each object should have a "title" and an array of "subtopics". Example: {"outline": [{"title": "Introduction", "subtopics": ["Hook", "Thesis"]}]}`;
    
    if (!genAI) {
        const fallbackOutline = {
            outline: [
                { title: "Introduction (Fallback)", subtopics: ["What is this topic about?"] },
                { title: "Main Point 1 (Fallback)", subtopics: ["Detail A", "Detail B"] },
                { title: "Conclusion (Fallback)", subtopics: ["Summary of points"] }
            ]
        };
        return res.status(200).json(fallbackOutline);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '');
        const outline = JSON.parse(text);
        res.status(200).json(outline);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate outline from AI", error: error.message });
    }
});

const generateBlog = asyncHandler(async (req, res) => {
    const { topic, tone } = req.body;
    if (!topic) {
        res.status(400);
        throw new Error('Please provide a topic');
    }
    const prompt = `Write a comprehensive blog post about "${topic}". The tone should be ${tone || 'professional'}. The output should be a single block of clean HTML, using tags like <h1>, <h2>, <p>, <ul>, <li>, and <strong>. Do not include <html>, <head>, or <body> tags.`;
    const content = await generateContent(prompt);
    res.status(200).json({ content });
});

const generateSEO = asyncHandler(async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        res.status(400);
        throw new Error('Please provide a topic');
    }
    const prompt = `Generate SEO metadata for a blog post about "${topic}". Provide a meta title (around 60 characters), a meta description (around 155 characters), and an array of 5-7 relevant keywords. Return as a JSON object with keys "metaTitle", "metaDescription", and "keywords".`;
    
    if (!genAI) {
        const fallbackSEO = {
            metaTitle: `Fallback Meta Title for ${topic}`,
            metaDescription: `This is a fallback meta description for a blog post about ${topic}.`,
            keywords: ["fallback", "seo", "keywords"]
        };
        return res.status(200).json(fallbackSEO);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '');
        const seo = JSON.parse(text);
        res.status(200).json(seo);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate SEO from AI", error: error.message });
    }
});

const generateFAQ = asyncHandler(async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        res.status(400);
        throw new Error('Please provide a topic');
    }
    const prompt = `Generate a list of 5 to 10 frequently asked questions (FAQs) about "${topic}". For each question, provide a concise answer. Format the output as a single block of clean HTML using <h2> for the FAQ section title, <h3> for each question, and <p> for each answer.`;
    const content = await generateContent(prompt);
    res.status(200).json({ content });
});

const generateImagePrompt = asyncHandler(async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        res.status(400);
        throw new Error('Please provide a topic');
    }
    const prompt = `Create a detailed, descriptive image generation prompt for an AI art generator like Midjourney or DALL-E. The image should be for a blog post about "${topic}". The prompt should be a single paragraph describing the scene, style, lighting, and composition.`;
    const content = await generateContent(prompt);
    res.status(200).json({ content });
});

const rewriteContent = asyncHandler(async (req, res) => {
    const { text, mode } = req.body;
    if (!text || !mode) {
        res.status(400);
        throw new Error('Please provide text and a rewrite mode.');
    }

    let prompt;
    switch (mode) {
        case 'professional':
            prompt = `Rewrite the following text in a professional tone:\n\n"${text}"`;
            break;
        case 'simple':
            prompt = `Rewrite the following text in a simple, easy-to-understand way:\n\n"${text}"`;
            break;
        case 'expand':
            prompt = `Expand on the following text, adding more detail and depth:\n\n"${text}"`;
            break;
        case 'shorten':
            prompt = `Shorten the following text, keeping the core message intact:\n\n"${text}"`;
            break;
        case 'grammar':
            prompt = `Correct any grammar and spelling mistakes in the following text:\n\n"${text}"`;
            break;
        default:
            res.status(400);
            throw new Error('Invalid rewrite mode specified.');
    }

    const content = await generateContent(prompt);
    res.status(200).json({ content });
});

const analyzeContent = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400);
        throw new Error('Please provide text to analyze.');
    }

    const prompt = `Analyze the following blog post text and provide an estimated reading time, a readability score (out of 100), and an SEO score (out of 100). Return the response as a JSON object with keys "readingTime", "readabilityScore", and "seoScore". For example: {"readingTime": "5 minutes", "readabilityScore": 85, "seoScore": 92}. Text to analyze: \n\n"${text}"`;

    if (!genAI) {
        return res.status(200).json({ readingTime: "4 minutes", readabilityScore: 88, seoScore: 75 });
    }

    const content = await generateContent(prompt);
    const analysis = JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));
    res.status(200).json(analysis);
});

export {
    generateTitle,
    generateOutline,
    generateBlog,
    generateSEO,
    generateFAQ,
    generateImagePrompt,
    rewriteContent,
    analyzeContent
};