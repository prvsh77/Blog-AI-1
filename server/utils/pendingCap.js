import Blog from '../models/Blog.js';

export const maxPendingPerUser = () => {
    const n = Number.parseInt(process.env.MAX_PENDING_POSTS_PER_USER, 10);
    return Number.isInteger(n) && n > 0 ? n : 3;
};

// Throws if the author already has the maximum number of posts awaiting review.
// Equality-only query so it works on the mock DB's countDocuments as well.
export const assertPendingCapacity = async (authorId) => {
    const limit = maxPendingPerUser();
    const pending = await Blog.countDocuments({ author: authorId, status: 'pending' });
    if (pending >= limit) {
        throw new Error(`You already have ${pending} post${pending === 1 ? '' : 's'} awaiting review — the limit is ${limit}. Wait for a review before submitting more.`);
    }
};
