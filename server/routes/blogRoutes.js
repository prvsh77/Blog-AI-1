import express from "express";
import {
  addBlog,
  addComment,
  deleteBlogById,
  generateContent,
  getAllBlogs,
  getBlogById,
  getBlogComments,
  togglePublish,
  getTopics,
  getRelatedBlogs,
  incrementViews,
  askAiAboutArticle,
  subscribeNewsletter,
  getBookmarkedBlogs,
  toggleBookmark
} from "../controllers/blogController.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";

const blogRouter = express.Router();

blogRouter.post("/add", upload.single('image'), auth, addBlog);
blogRouter.get('/all', getAllBlogs);
blogRouter.get('/related', getRelatedBlogs);
blogRouter.post('/subscribe', subscribeNewsletter);
blogRouter.post('/:blogId/view', incrementViews);
blogRouter.post('/:blogId/ask-ai', askAiAboutArticle);
blogRouter.get("/bookmarks",auth,getBookmarkedBlogs);
blogRouter.get('/:blogId', getBlogById);
blogRouter.post('/delete', auth, deleteBlogById);
blogRouter.post('/toggle-publish', auth, togglePublish);
blogRouter.post('/add-comment', addComment);
blogRouter.post('/comments', getBlogComments);
blogRouter.post('/give-topics', auth, getTopics);
blogRouter.post('/generate', auth, generateContent);
blogRouter.post("/bookmark",auth,toggleBookmark);

export default blogRouter;