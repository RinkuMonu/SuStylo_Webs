import express from "express";
import {
  createReferral,
  updateReferralReward,
  completeReferralReward,
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

// 🔹 Normal users -> referral history
router.get(
  "/history",
  authenticateAndAuthorize(["customer"], { unauthorizedMsg: "Login required!" }),
  getReferralHistory
);

// 🔹 Complete referral (80% reward after first booking)
router.post(
  "/complete",
  authenticateAndAuthorize(["system", "admin"], { forbiddenMsg: "Only system/admin can complete referral!" }),
  completeReferralReward
);

// 🔹 Super Admin -> update reward
router.put(
  "/reward",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only Super Admin can update reward!" }),
  updateReferralReward
);

// 🔹 Super Admin -> view all referrals
router.get(
  "/",
  authenticateAndAuthorize(["super_admin"], { forbiddenMsg: "Only Super Admin can view all referrals!" }),
  getAllReferrals
);

export default router;