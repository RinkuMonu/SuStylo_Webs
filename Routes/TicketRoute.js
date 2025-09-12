import express from "express";
import {
  raiseTicket,
  replyTicket,
  getTickets,
  getTicketsByStatus,
  getTicketsGrouped
} from "../controllers/ticketController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, raiseTicket);
router.post("/:ticketId/reply", authMiddleware, replyTicket);
router.get("/", authMiddleware, getTickets);
router.get("/status/:status", authMiddleware, getTicketsByStatus);
router.get("/grouped/status", authMiddleware, getTicketsGrouped);

export default router;
