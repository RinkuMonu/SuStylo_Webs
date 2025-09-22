import express from "express";
import {
  createCommission,
  updateCommission,
  getCommissions,
  deleteCommission,
} from "../Controllers/CommissionController.js";
import { authenticateAndAuthorize  } from "../Middlewares/AuthMiddleware.js"; // make sure this exists

const router = express.Router();

// All routes protected by auth middleware (super admin/admin)
router.use(authenticateAndAuthorize);

// ✅ Create commission (global or per salon/freelancer)
router.post("/", createCommission);

// ✅ Update commission
router.put("/:id", updateCommission);

// ✅ Get all commissions
router.get("/", getCommissions);

// ✅ Delete commission
router.delete("/:id", deleteCommission);

export default router;