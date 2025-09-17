import express from "express";
import {
  createAppointment,
  getAppointmentById,
  getAllAppointments,
  getAppointmentsByStaff,
  getAppointmentsByUser,
  updateAppointmentStatus,
  rescheduleAppointment,
  updateAppointmentNotes,
  deleteAppointment,
} from "../Controllers/AppointmentController.js";

import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Create Appointment
router.post(
  "/",
  authenticateAndAuthorize(["admin", "super_admin", "freelancer"]),
  createAppointment
);

// Get by ID
router.get("/:id", authenticateAndAuthorize(["admin", "super_admin", "freelancer", "user"]), getAppointmentById);

// Get all (role based filter)
router.get("/", authenticateAndAuthorize(["admin", "super_admin", "freelancer"]), getAllAppointments);

// Get by Staff (only salon owner & super admin)
router.get("/staff/:staffId", authenticateAndAuthorize(["admin", "super_admin"]), getAppointmentsByStaff);

// Get by User
router.get("/user/:userId", authenticateAndAuthorize(["user", "admin", "super_admin", "freelancer"]), getAppointmentsByUser);

// Update Status
router.put("/status/:id", authenticateAndAuthorize(["admin", "super_admin", "freelancer"]), updateAppointmentStatus);

// Reschedule
router.put("/reschedule/:id", authenticateAndAuthorize(["admin", "super_admin", "freelancer"]), rescheduleAppointment);

// Update Notes
router.put("/notes/:id", authenticateAndAuthorize(["admin", "super_admin", "freelancer", "user"]), updateAppointmentNotes);

// Delete Appointment
router.delete("/:id", authenticateAndAuthorize(["admin", "super_admin", "freelancer"]), deleteAppointment);

export default router;
