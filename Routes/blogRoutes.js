import express from "express";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  getBlogById,
  getBlogsByCategory,
  getBlogBySlug,
  addComment,
  getCommentsByStatus,
  approveComment,
  rejectComment,
} from "../Controllers/blogController.js";

import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Cloudinary multer
const upload = uploadToCloudinary("blogs");

// fields
const uploadBlogImages = upload.fields([
  { name: "images", maxCount: 20 },
  { name: "coverImage", maxCount: 1 },
]);

router.post("/create", uploadBlogImages, createBlog);
router.put("/update/:id", uploadBlogImages, updateBlog);
router.delete("/delete/:id", deleteBlog);

router.get("/list", getBlogs);
router.get("/:id", getBlogById);
router.get("/slug/:slug", getBlogBySlug);
router.get("/category/:category", getBlogsByCategory);
router.post("/:blogId/comment", addComment);
router.get("/", getCommentsByStatus);
router.put("/comment/:id/approve", approveComment);

router.put("/comment/:id/reject", rejectComment);

export default router;
