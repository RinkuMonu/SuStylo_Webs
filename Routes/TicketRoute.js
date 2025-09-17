import express from "express";
import {
  raiseTicket,
  replyTicket,
  getTickets,
  getTicketsByStatus,
  getTicketsGrouped,
} from "../controllers/ticketController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";


const router = express.Router();


router.post(
  "/",
  authenticateAndAuthorize(["user", "staff", "admin", "super_admin"], { unauthorizedMsg: "Login required" }),
  raiseTicket
);


router.post(
  "/:ticketId/reply",
  authenticateAndAuthorize(["staff", "admin", "super_admin"], { forbiddenMsg: "Not allowed to reply to ticket" }),
  replyTicket
);


router.get(
  "/",
  authenticateAndAuthorize(["admin", "super_admin"], { forbiddenMsg: "Not allowed to view tickets" }),
  getTickets
);


router.get(
  "/status/:status",
  authenticateAndAuthorize(["admin", "super_admin"], { forbiddenMsg: "Not allowed to view tickets by status" }),
  getTicketsByStatus
);


router.get(
  "/grouped/status",
  authenticateAndAuthorize(["admin", "super_admin"], { forbiddenMsg: "Not allowed to view grouped tickets" }),
  getTicketsGrouped
);

export default router;
