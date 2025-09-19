import express from "express";
import { sendNotificationToRole } from "../Controllers/NotificationController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Only Admin can send broadcast notifications
router.post(
  "/send-to-all",
  authenticateAndAuthorize(["admin", "superAdmin"]),
  sendNotificationToRole
);``

export default router;
