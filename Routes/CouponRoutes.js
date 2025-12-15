import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
} from "../Controllers/CouponController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Admin-only routes
router.post(
  "/",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"], { unauthorizedMsg: "Login required", forbiddenMsg: "Only Authorized role can manage coupon" }),
  uploadToCloudinary("coupons").single("image"),
  createCoupon
);

router.put(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"], { forbiddenMsg: "Only Authorized role can manage coupon" }),
  uploadToCloudinary("coupons").single("image"),
  updateCoupon
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"], { forbiddenMsg: "Only Authorized role can manage coupon" }),
  deleteCoupon
);

// Public routes
router.get("/", getAllCoupons);
router.get("/:id", getCouponById);

export default router;
