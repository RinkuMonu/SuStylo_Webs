import express from "express";
import { getBookingHistory, getBookingById } from "../Controllers/BookingController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon","Staff"], { forbiddenMsg: "Not allowed to view bookings" }),
  getBookingHistory
);

router.get(
  "/:id",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon","Staff"], { forbiddenMsg: "Not allowed to view booking" }),
  getBookingById
);

export default router;
