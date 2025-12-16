// import express from "express";
// import {
//   createSchedule,
//   getAllSchedules,
//   getScheduleById,
//   updateSchedule,
//   deleteSchedule
// } from "../Controllers/ScheduleController.js";
// import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

// const router = express.Router();

// router.post(
//   "/",
//   authenticateAndAuthorize([ "super_admin", "admin", "Salon", "freelancer" ], { forbiddenMsg: "Not allowed to create schedule" }),
//   createSchedule
// );

// router.get(
//   "/",
//   authenticateAndAuthorize([ "super_admin", "admin", "Salon", "freelancer" ], { forbiddenMsg: "Not allowed to view schedules" }),
//   getAllSchedules
// );

// router.get(
//   "/:id",
//   authenticateAndAuthorize([ "super_admin", "admin", "Salon", "freelancer" ], { forbiddenMsg: "Not allowed" }),
//   getScheduleById
// );

// router.put(
//   "/:id",
//   authenticateAndAuthorize([ "super_admin", "admin", "Salon", "freelancer" ], { forbiddenMsg: "Not allowed" }),
//   updateSchedule
// );

// router.delete(
//   "/:id",
//   authenticateAndAuthorize([ "super_admin", "admin", "Salon", "freelancer" ], { forbiddenMsg: "Not allowed" }),
//   deleteSchedule
// );

// export default router;





import express from "express";
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  getScheduleBySalonId,
  updateSchedule,
  deleteSchedule
} from "../Controllers/ScheduleController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// 🔹 Allowed roles: super_admin, admin (salon owner), freelancer
router.post(
  "/",
  authenticateAndAuthorize([ "super_admin", "admin", "freelancer" ], { forbiddenMsg: "Not allowed to create schedule" }),
  createSchedule
);

router.get(
  "/",
  authenticateAndAuthorize([ "super_admin", "admin", "freelancer" ], { forbiddenMsg: "Not allowed to view schedules" }),
  getAllSchedules
);

router.get(
  "/:id",
  authenticateAndAuthorize([ "super_admin", "admin", "freelancer" ], { forbiddenMsg: "Not allowed" }),
  getScheduleById
);
router.get(
  "/getSalonSchedule/:id",
  getScheduleBySalonId
);
router.put(
  "/:id",
  authenticateAndAuthorize([ "super_admin", "admin", "freelancer" ], { forbiddenMsg: "Not allowed" }),
  updateSchedule
);

router.delete(
  "/:id",
  authenticateAndAuthorize([ "super_admin", "admin", "freelancer" ], { forbiddenMsg: "Not allowed" }),
  deleteSchedule
);

export default router;
