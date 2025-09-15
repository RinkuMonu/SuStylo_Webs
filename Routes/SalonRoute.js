import express from "express";
import {
  createSalon,
  getAllSalons,
  getSalonById,
  updateSalon,
  deleteSalon,
  toggleSalonStatus,
} from "../Controllers/SalonController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { ADMIN_ROLES } from "../Models/AdminModal.js"; // Assuming includes SuperAdmin, Admin
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";

// also roles definitions for Salon, Freelancer

const router = express.Router();

// Admin/SuperAdmin can do all, Salon can do some, Freelancer none for Salon routes

router.post(
  "/",
  authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon"], { forbiddenMsg: "Not allowed to create salon" }),
  createSalon
);

router.get(
  "/",
  // authenticateAndAuthorize([ "SuperAdmin", "Admin" ], { forbiddenMsg: "Only admin can view all salons" }),
  getAllSalons
);

router.get(
  "/:id",
  // authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon"], { forbiddenMsg: "Not allowed" }),
  getSalonById
);

// router.put(
//   "/:id",
//   authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon"], { forbiddenMsg: "Not allowed" }),
//   updateSalon
// );

router.put(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "Salon"], { forbiddenMsg: "Not allowed" }),
  uploadToCloudinary("salons").fields([
    { name: "photos", maxCount: 10 },
    { name: "agreementDocs", maxCount: 5 }
  ]),
  updateSalon
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "Salon"], { forbiddenMsg: "Not allowed" }),
  deleteSalon
);

router.post(
  "/:id/toggle-status",
  authenticateAndAuthorize(["super_admin", "admin", "Salon"], { forbiddenMsg: "Not allowed" }),
  toggleSalonStatus
);

export default router;
