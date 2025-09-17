// import express from "express";
// import {
//     createBanner,
//     getBanners,
//     getBannerById,
//     updateBanner,
//     deleteBanner,
// } from "../Controllers/Banner.js";

// const router = express.Router();

// router.post("/", createBanner);
// router.get("/", getBanners);
// router.get("/:id", getBannerById);
// router.put("/:id", updateBanner);
// router.delete("/:id", deleteBanner);

// export default router;



import express from "express";
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} from "../Controllers/Banner.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// 🔹 Only superAdmin can create/update/delete
router.post(
  "/",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only Super Admin can create banners!" }),
  uploadToCloudinary("banners").single("image"),
  createBanner
);

router.put(
  "/:id",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only Super Admin can update banners!" }),
  uploadToCloudinary("banners").single("image"),
  updateBanner
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only Super Admin can delete banners!" }),
  deleteBanner
);

// 🔹 Public Routes
router.get("/", getBanners);
router.get("/:id", getBannerById);

export default router;
