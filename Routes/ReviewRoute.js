import express from "express";
import {
  createOrUpdateReview,
  approveReview,
  rejectReview,
  getReviewsForTarget,
} from "../Controllers/RatReview.js";

import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/reviews", authenticateAndAuthorize(), createOrUpdateReview);
router.put(
  "/reviews/approve/:reviewId",
  authenticateAndAuthorize(["admin", "superAdmin"]),
  approveReview
);
router.put(
  "/reviews/reject/:reviewId",
  authenticateAndAuthorize(["admin", "superAdmin"]),
  rejectReview
);
router.get("/reviews/:reviewFor/:targetId", getReviewsForTarget);

export default router;