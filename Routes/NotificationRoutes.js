import express from "express";
import {
  sendNotificationToRole,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from "../Controllers/NotificationController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// 🔒 Super Admin Only
router.post(
  "/send-to-role",
  authenticateAndAuthorize(["superAdmin"]),
  sendNotificationToRole
);

router.get(
  "/",
  authenticateAndAuthorize(["superAdmin"]),
  getAllNotifications
);

router.get(
  "/:id",
  authenticateAndAuthorize(["superAdmin"]),
  getNotificationById
);

router.put(
  "/:id",
  authenticateAndAuthorize(["superAdmin"]),
  updateNotification
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["superAdmin"]),
  deleteNotification
);

export default router;