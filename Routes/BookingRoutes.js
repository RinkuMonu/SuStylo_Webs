import express from "express";
import {
  createBooking,
  getBookingsByUser,
  // updateBookingStatusByProvider,
  confirmBookingPayment,
//h
  // completeBooking,
  cancelBooking,
} from "../Controllers/BookingController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();


// Customer creates booking
router.post("/",authenticateAndAuthorize(["customer"]),createBooking);
router.get("/user/", authenticateAndAuthorize(["customer", "admin", "freelancer"]), getBookingsByUser);
// Salon/Freelancer approve/reject booking
// router.put("/:bookingId/status", authenticateAndAuthorize(["freelancer", "admin"]), updateBookingStatusByProvider);

// Customer confirms with payment
router.put("/:bookingId/confirm", authenticateAndAuthorize(["customer"]), confirmBookingPayment);

// Mark booking complete
// router.put("/:bookingId/complete", authenticateAndAuthorize(["admin", "freelancer"]), completeBooking);

// Cancel booking
router.put("/:bookingId/cancel", authenticateAndAuthorize(["customer", "admin"]), cancelBooking);

export default router;