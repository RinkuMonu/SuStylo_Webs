import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../Controllers/CouponController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Admin-only routes
router.post(
  "/",
  authenticateAndAuthorize(["super_admin"], { unauthorizedMsg: "Login required", forbiddenMsg: "Only super_admin can create coupons" }),
  uploadToCloudinary("coupons").single("image"),
  createCoupon
);

router.put(
  "/:id",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only super_admin can update coupons" }),
  uploadToCloudinary("coupons").single("image"),
  updateCoupon
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only super_admin can delete coupons" }),
  deleteCoupon
);

// Public routes
router.get("/", getAllCoupons);
router.get("/:id", getCouponById);
router.post("/validate", validateCoupon);

export default router;
