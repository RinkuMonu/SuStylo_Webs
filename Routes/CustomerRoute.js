import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getProfile,
  updateProfile,
  deleteAccount,
  sendOtp,
  verifyOtp,
  resetPassword,
  getAllCustomers,
  getByIdCustomer
} from "../Controllers/Customer.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Register with profile picture upload
router.post("/register", uploadToCloudinary("users").single("avatar"), registerCustomer);

// Login
router.post("/login", loginCustomer);

// Profile
router.get("/profile", authenticateAndAuthorize(["customer"]), getProfile);
router.get("/get-all",  getAllCustomers);
router.get("/:id", getByIdCustomer);

// authenticateAndAuthorize(["super_admin"]),

// Update Profile
router.put("/profile", authenticateAndAuthorize(["customer"]), uploadToCloudinary("users").single("avatar"), updateProfile);

// Soft delete
router.delete("/delete", authenticateAndAuthorize(["customer"]), deleteAccount);

// Forgot password - OTP flow
router.post("/forgot-password/send-otp", sendOtp);
router.post("/forgot-password/verify-otp", verifyOtp);
router.post("/forgot-password/reset", resetPassword);

export default router;

