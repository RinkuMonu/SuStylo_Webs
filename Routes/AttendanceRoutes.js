// import express from "express";
// import { markAttendance, getAttendanceByStaff, getAllAttendances } from "../Controllers/AttendenceController.js";
// import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

// const router = express.Router();

// router.post(
//   "/",
//   authenticateAndAuthorize(["super_admin","admin","Salon"], { forbiddenMsg: "Not allowed to mark attendance" }),
//   markAttendance
// );

// router.get(
//   "/staff/:staffId",
//   authenticateAndAuthorize(["super_admin","admin","Salon"], { forbiddenMsg: "Not allowed to view attendance of staff" }),
//   getAttendanceByStaff
// );

// router.get(
//   "/",
//   authenticateAndAuthorize(["super_admin","admin","Salon"], { forbiddenMsg: "Not allowed to view attendances" }),
//   getAllAttendances
// );

// export default router;



import express from "express";
import { markAttendance, getAttendanceByStaff, getAllAttendances } from "../Controllers/AttendenceController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateAndAuthorize(["super_admin", "admin", "staff"], { forbiddenMsg: "Not allowed to mark attendance" }),
  markAttendance
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
