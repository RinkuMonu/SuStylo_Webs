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

const router = express.Router();

router.post(
  "/",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Freelancer" ], { forbiddenMsg: "Not allowed to create freelancer" }),
  createFreelancer
);

router.get(
  "/",
  authenticateAndAuthorize([ "SuperAdmin", "Admin" ], { forbiddenMsg: "Only admins can view all freelancers" }),
  getAllFreelancers
);

router.get(
  "/:id",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Freelancer" ], { forbiddenMsg: "Not allowed" }),
  getFreelancerById
);

router.put(
  "/:id",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Freelancer" ], { forbiddenMsg: "Not allowed" }),
  updateFreelancer
);

router.delete(
  "/:id",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Freelancer" ], { forbiddenMsg: "Not allowed" }),
  deleteFreelancer
);

router.post(
  "/:id/toggle-status",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Freelancer" ], { forbiddenMsg: "Not allowed" }),
  toggleFreelancerStatus
);

export default router;
