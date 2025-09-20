import express from "express";
import {
  createBooking,
  updateBookingStatusByProvider,
  confirmBookingPayment,
  completeBooking,
  cancelBooking,
} from "../Controllers/BookingController.js";
import { authenticateAndAuthorize } from "../Middleware/auth.js";

const router = express.Router();

// Customer creates booking
router.post("/", authenticateAndAuthorize(["customer"]), createBooking);

// Salon/Freelancer approve/reject booking
router.put("/:bookingId/status", authenticateAndAuthorize(["salon", "freelancer", "admin"]), updateBookingStatusByProvider);

// Customer confirms with payment
router.put("/:bookingId/confirm", authenticateAndAuthorize(["customer"]), confirmBookingPayment);

// Mark booking complete
router.put("/:bookingId/complete", authenticateAndAuthorize(["salon", "freelancer"]), completeBooking);

// Cancel booking
router.put("/:bookingId/cancel", authenticateAndAuthorize(["customer", "admin"]), cancelBooking);

export default router;