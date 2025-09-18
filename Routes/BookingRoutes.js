import express from "express";
import {
  createBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} from "../Controllers/BookingController.js";
import { authenticateAndAuthorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Customer
router.post("/", authenticateAndAuthorize(["customer"]), createBooking);
router.put("/:bookingId/cancel", authenticateAndAuthorize(["customer"]), cancelBooking);

// Salon/Freelancer
router.put("/:bookingId/approve", authenticateAndAuthorize(["salon", "freelancer"]), approveBooking);
router.put("/:bookingId/reject", authenticateAndAuthorize(["salon", "freelancer"]), rejectBooking);

// Admin/Salon/Freelancer (complete after service)
router.put(
  "/:bookingId/complete",
  authenticateAndAuthorize(["admin", "freelancer", "salonOwner"]),
  completeBooking
);

export default router;