import express from "express";
import {
  createLead,
  updateLead,
  approveLead,
  rejectLead,
  getAllLeads,
} from "../controllers/leadController.js";
import { authMiddleware, superAdminMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createLead);

router.put("/:leadId", authMiddleware, updateLead);

router.put("/approve/:leadId", authMiddleware, superAdminMiddleware, approveLead);
router.put("/reject/:leadId", authMiddleware, superAdminMiddleware, rejectLead);

router.get("/", authMiddleware, superAdminMiddleware, getAllLeads);

export default router;
