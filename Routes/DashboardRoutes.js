import express from "express";
import { 
  getUnifiedDashboard
} from "../Controllers/DashboardController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();
router.get("/dashboard", authenticateAndAuthorize(["superadmin", "admin", "freelancer"]), getUnifiedDashboard);
// Super Admin Route
// router.get(
//   "/super-admin", 
//   authenticateAndAuthorize(["super_admin"]), 
//   getSuperAdminDashboard
// );

// // Admin (Salon Owner) Route
// router.get(
//   "/admin", 
//   authenticateAndAuthorize(["admin"]), 
//   getAdminDashboard
// );

// // Freelancer Route
// router.get(
//   "/freelancer", 
//   authenticateAndAuthorize(["freelancer"]), 
//   getFreelancerDashboard
// );

export default router;