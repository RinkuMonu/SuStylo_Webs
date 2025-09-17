import express from "express";
import {
  createOrUpdateReview,
  approveReview,
  rejectReview,
  getReviewsForTarget,
} from "../Controllers/RatReview.js";

import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/", authenticateAndAuthorize(), createOrUpdateReview);
router.put(
  "/approve/:reviewId",
  authenticateAndAuthorize(["admin", "super_admin"]),
  approveReview
);
router.put(
  "/reject/:reviewId",
  authenticateAndAuthorize(["admin", "super_admin"]),
  rejectReview
);
router.get("/:reviewFor/:targetId", getReviewsForTarget);

export default router;