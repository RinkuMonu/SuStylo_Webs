import express from "express";
import {
  createReferral,
  updateReferralReward,
  getReferralHistory,
  getAllReferrals
} from "../Controllers/ReferController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// 🔹 Normal users -> create referral
router.post(
  "/",
  authenticateAndAuthorize(["customer"], { unauthorizedMsg: "Login required!" }),
  createReferral
);

router.get(
  "/history",
  authenticateAndAuthorize(["customer"], { unauthorizedMsg: "Login required!" }),
  getReferralHistory
);

// 🔹 Super Admin -> update reward
router.put(
  "/reward",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only Super Admin can update reward!" }),
  updateReferralReward
);

router.get(
  "/",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only Super Admin can view all referrals!" }),
  getAllReferrals
);

export default router;
