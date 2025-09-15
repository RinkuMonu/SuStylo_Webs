import express from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../Controllers/StaffController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Create staff (with avatar upload)
router.post(
  "/",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon"], { forbiddenMsg: "Not allowed to create staff" }),
  uploadToCloudinary("staff").single("avatar"),
  createStaff
);

router.get(
  "/",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon"], { forbiddenMsg: "Not allowed to view staff list" }),
  getAllStaff
);

router.get(
  "/:id",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon"], { forbiddenMsg: "Not allowed to view staff" }),
  getStaffById
);

router.put(
  "/:id",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon"], { forbiddenMsg: "Not allowed to update staff" }),
  uploadToCloudinary("staff").single("avatar"),
  updateStaff
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon"], { forbiddenMsg: "Not allowed to delete staff" }),
  deleteStaff
);

export default router;
