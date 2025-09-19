




import express from "express";
import {
  assignAppointment,
  getAllAppointments,
  getAppointmentsByStaff,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
} from "../Controllers/AppointmentController.js";

import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Assign Appointment
router.post("/", authenticateAndAuthorize(["admin"]), assignAppointment);

// Get All Appointments (Salon level)
router.get("/", authenticateAndAuthorize(["admin"]), getAllAppointments);

// Get Appointments by Staff
router.get("/staff/:staffId", authenticateAndAuthorize(["admin"]), getAppointmentsByStaff);

// Update Appointment
router.put("/:id", authenticateAndAuthorize(["admin"]), updateAppointment);

// Cancel Appointment
router.put("/cancel/:id", authenticateAndAuthorize(["admin"]), cancelAppointment);

// Delete Appointment
router.delete("/:id", authenticateAndAuthorize(["admin"]), deleteAppointment);

export default router;
