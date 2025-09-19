import express from "express";
import { createReferral, updateReferralReward, getReferralHistory, getAllReferrals  } from "../controllers/referralController.js";
import { authenticateAndAuthorize } from "../middlewares/authRoleMiddleware.js";

const router = express.Router();

// 🔹 Normal users can create referral
router.post(
  "/referrals",
  authenticateAndAuthorize(["User"], { unauthorizedMsg: "Login required!" }),
  createReferral
);

router.get(
  "/referrals/history",
  authenticateAndAuthorize(["User"], { unauthorizedMsg: "Login required!" }),
  getReferralHistory
);

// 🔹 Super Admin can update referral reward amount
router.put(
  "/referrals/reward",
  authenticateAndAuthorize(["superAdmin"], { forbiddenMsg: "Only Super Admin can update reward!" }),
  updateReferralReward
);

router.get(
  "/referrals",
  authenticateAndAuthorize(["superAdmin"], { forbiddenMsg: "Only Super Admin can view all referrals!" }),
  getAllReferrals
);

export default router;