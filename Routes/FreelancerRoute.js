
import express from "express";
import {
  createFreelancer,
  getAllFreelancers,
  getFreelancerById,
  updateFreelancer,
  deleteFreelancer,
  toggleFreelancerStatus
} from "../Controllers/FreelancerController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js"; // optional, if you plan to upload files like photo/docs

const router = express.Router();

// Admin/SuperAdmin can do all, Freelancer can do some, others none

router.post(
  "/",
  authenticateAndAuthorize(["SuperAdmin", "Admin", "Freelancer"], { forbiddenMsg: "Not allowed to create freelancer" }),
  createFreelancer
);

router.get(
  "/",
  getAllFreelancers
);

router.get(
  "/:id",
  getFreelancerById
);

router.put(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "Freelancer"], { forbiddenMsg: "Not allowed" }),
  uploadToCloudinary("freelancers").fields([
    { name: "photos", maxCount: 10 },
    { name: "agreementDocs", maxCount: 5 }
  ]), // optional
  updateFreelancer
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "Freelancer"], { forbiddenMsg: "Not allowed" }),
  deleteFreelancer
);

router.post(
  "/:id/toggle-status",
  authenticateAndAuthorize(["super_admin", "admin", "Freelancer"], { forbiddenMsg: "Not allowed" }),
  toggleFreelancerStatus
);

export default router;
