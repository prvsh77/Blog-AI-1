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
  toggleBookmark,
  submitBlog,
  getMyBlogs,
  updateBlog
} from "../controllers/blogController.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";
import { userProtect } from "../middleware/userAuthMiddleware.js";
import authorOrAdmin from "../middleware/authorOrAdmin.js";

const blogRouter = express.Router();

blogRouter.post("/add", upload.single('image'), auth, addBlog);
blogRouter.get('/all', getAllBlogs);
blogRouter.get('/related', getRelatedBlogs);
blogRouter.post('/subscribe', subscribeNewsletter);
blogRouter.post('/:blogId/view', incrementViews);
blogRouter.post('/:blogId/ask-ai', askAiAboutArticle);
blogRouter.get("/bookmarks",userProtect,getBookmarkedBlogs);
blogRouter.post('/submit', upload.single('image'), userProtect, submitBlog);
blogRouter.get('/mine', userProtect, getMyBlogs);
blogRouter.get('/:blogId', getBlogById);
blogRouter.post('/delete', authorOrAdmin, deleteBlogById);
blogRouter.post('/toggle-publish', authorOrAdmin, togglePublish);
blogRouter.put('/:id', upload.single('image'), authorOrAdmin, updateBlog);
blogRouter.post('/add-comment', addComment);
blogRouter.post('/comments', getBlogComments);
blogRouter.post('/give-topics', auth, getTopics);
blogRouter.post('/generate', auth, generateContent);
blogRouter.post("/bookmark",userProtect,toggleBookmark);

export default blogRouter;