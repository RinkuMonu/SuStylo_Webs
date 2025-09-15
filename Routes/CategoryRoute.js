import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../Controllers/CategoryController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";


const router = express.Router();

// Only admin/superAdmin can create/update/delete category
// router.post("/", authenticateAndAuthorize(["admin", "superAdmin"], { forbiddenMsg: "Not authorized to create category" }), createCategory);
router.post(
  "/",
  authenticateAndAuthorize(["admin", "superAdmin"]),
  uploadToCloudinary("categories").single("image"),   // ⬅️ image upload to "categories" folder
  createCategory
);
// router.put("/:id", authenticateAndAuthorize(["admin", "superAdmin"], { forbiddenMsg: "Not authorized to update category" }), updateCategory);

router.put(
  "/:id",
  authenticateAndAuthorize(["admin", "superAdmin"]),
  uploadToCloudinary("categories").single("image"),
  updateCategory
);
router.delete("/:id", authenticateAndAuthorize(["admin", "superAdmin"], { forbiddenMsg: "Not authorized to delete category" }), deleteCategory);

// Get all / by id (public)
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

export default router;
