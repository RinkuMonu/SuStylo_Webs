import express from "express";
import {
  createBooking,
  getBookingsByUser,
  // updateBookingStatusByProvider,
  confirmBookingPayment,
//h
  // completeBooking,
  cancelBooking,
  getAllBookingsForAdmin,
  getBookingsByProvider,
  approveBookingByProvider,
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
router.put("/:bookingId/cancel", authenticateAndAuthorize(["customer", "admin" , "freelancer"]), cancelBooking);




// Admin gets all bookings (with optional filters)
router.get("/admin/", authenticateAndAuthorize(["super_admin"]), getAllBookingsForAdmin);

// Freelancer/Salon owner gets their bookings
router.get("/provider/", authenticateAndAuthorize(["freelancer", "admin"]), getBookingsByProvider);

// Freelancer/Salon approves/rejects and updates price
router.put("/:bookingId/approve", authenticateAndAuthorize(["freelancer", "admin"]), approveBookingByProvider);

export default router;