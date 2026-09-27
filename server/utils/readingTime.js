const WORDS_PER_MINUTE = 225;

export const calculateReadingTime = (content = '') => {
    const text = String(content ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;|&#160;/gi, ' ')
        .replace(/&[a-z0-9#]+;/gi, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

// Works for both Mongoose documents and mock-DB BlogDoc objects; MockQuery has no .lean().
export const withReadTime = (blog) => {
    const plain = typeof blog.toObject === 'function' ? blog.toObject() : { ...blog };
    return { ...plain, readTime: calculateReadingTime(plain.description) };
};
