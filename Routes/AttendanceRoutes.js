import express from "express";
import { markAttendanceIn, markAttendanceOut, getAttendanceByStaff, getAllAttendances } from "../Controllers/AttendenceController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post(
  "/staff/:id",
  authenticateAndAuthorize(["admin", "staff"]),
  markAttendanceIn
);

router.put(
  "/staff/:id/markout",
  authenticateAndAuthorize(["admin", "staff"]),
  markAttendanceOut
);

router.get(
  "/staff/:staffId",
  authenticateAndAuthorize(["super_admin", "admin", "staff"], { forbiddenMsg: "Not allowed to view attendance" }),
  getAttendanceByStaff
);

router.get(
  "/",
  authenticateAndAuthorize(["super_admin", "admin"], { forbiddenMsg: "Not allowed to view attendances" }),
  getAllAttendances
);

export default router;
