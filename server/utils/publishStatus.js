// 'pending' = submitted by an author, awaiting admin review. Hidden from the
// public exactly like a draft; isPubliclyVisible only opens published/due posts.
export const STATUSES = ['draft', 'pending', 'scheduled', 'published'];

// Records written before `status` existed only have isPublished.
export const resolveStatus = (blog) => {
    if (blog.status) return blog.status;
    return blog.isPublished ? 'published' : 'draft';
};

export const isPubliclyVisible = (blog, now = new Date()) => {
    const status = resolveStatus(blog);
    if (status === 'published') return true;
    if (status === 'scheduled') return Boolean(blog.publishAt) && new Date(blog.publishAt) <= now;
    return false;
};

// Turns create-request input into the stored fields. Falls back to the legacy
// isPublished boolean for clients that don't send a status.
export const buildPublishFields = ({ status, publishAt, isPublished }) => {
    const resolved = status || (isPublished ? 'published' : 'draft');
    if (!STATUSES.includes(resolved)) {
        throw new Error(`Invalid status "${resolved}"`);
    }
    if (resolved === 'scheduled') {
        const date = new Date(publishAt);
        if (!publishAt || Number.isNaN(date.getTime())) {
            throw new Error('A valid publishAt date is required for scheduled posts');
        }
        return { status: 'scheduled', publishAt: date, isPublished: false };
    }
    if (resolved === 'published') {
        return { status: 'published', publishAt: new Date(), isPublished: true };
    }
    if (resolved === 'pending') {
        return { status: 'pending', publishAt: null, isPublished: false };
    }
    return { status: 'draft', publishAt: null, isPublished: false };
};

export const withStatus = (blog) => {
    const plain = typeof blog.toObject === 'function' ? blog.toObject() : { ...blog };
    return { ...plain, status: resolveStatus(plain), isLive: isPubliclyVisible(plain) };
};
