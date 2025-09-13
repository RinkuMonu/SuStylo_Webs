import express from "express";
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule
} from "../Controllers/ScheduleController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Salon", "Freelancer" ], { forbiddenMsg: "Not allowed to create schedule" }),
  createSchedule
);

router.get(
  "/",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Salon", "Freelancer" ], { forbiddenMsg: "Not allowed to view schedules" }),
  getAllSchedules
);

router.get(
  "/:id",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Salon", "Freelancer" ], { forbiddenMsg: "Not allowed" }),
  getScheduleById
);

router.put(
  "/:id",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Salon", "Freelancer" ], { forbiddenMsg: "Not allowed" }),
  updateSchedule
);

router.delete(
  "/:id",
  authenticateAndAuthorize([ "SuperAdmin", "Admin", "Salon", "Freelancer" ], { forbiddenMsg: "Not allowed" }),
  deleteSchedule
);

export default router;
