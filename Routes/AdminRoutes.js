import express from "express";
import {
  bootstrapSuperAdmin,
  loginAdmin,
  sendAdminOtp,
  verifyAdminOtp,
  resetAdminPassword,
  updateProfile,
  getAdminDetails,
  deleteAdmin,
} from "../Controllers/AdminController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js"; // JWT auth middleware
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";


const router = express.Router();

// Public routes
router.post("/bootstrap-superadmin", bootstrapSuperAdmin);
router.post("/login", loginAdmin);
router.post("/send-otp", sendAdminOtp);
router.post("/verify-otp", verifyAdminOtp);
router.post("/reset-password", resetAdminPassword);

// Protected routes (require login)
// router.put("/update-profile", authenticateAndAuthorize, updateProfile);
router.put(
  "/update-profile",
  authenticateAndAuthorize(),
  uploadToCloudinary("admin_avatars").single("avatar"),
  updateProfile
);

router.get("/details/:id", authenticateAndAuthorize(), getAdminDetails);
router.delete("/delete/:id", authenticateAndAuthorize(), deleteAdmin);

export default router;
