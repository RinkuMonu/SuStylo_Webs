import express from "express";
import { markAttendance, getAttendanceByStaff, getAllAttendances } from "../Controllers/AttendanceController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon"], { forbiddenMsg: "Not allowed to mark attendance" }),
  markAttendance
);

router.get(
  "/staff/:staffId",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon"], { forbiddenMsg: "Not allowed to view attendance of staff" }),
  getAttendanceByStaff
);

router.get(
  "/",
  authenticateAndAuthorize(["SuperAdmin","Admin","Salon"], { forbiddenMsg: "Not allowed to view attendances" }),
  getAllAttendances
);

export default router;
