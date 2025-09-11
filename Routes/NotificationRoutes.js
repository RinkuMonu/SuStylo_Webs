import express from "express";
import { sendToUser, sendToAll } from "../Controllers/Notification.js";

const router = express.Router();

// Send notification to single user
router.post("/send-notification", sendToUser);

// Send notification to all users
router.post("/send-notification-all", sendToAll);

export default router;
