import express from "express";
import {
  createServiceCombo,
  updateServiceCombo,
  getAllServiceCombos,
  getServiceComboById,
  deleteServiceCombo,
} from "../Controllers/ServiceComboController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Create combo
router.post(
  "/",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"]),
  uploadToCloudinary("service-combos").single("photo"),
  createServiceCombo
);

// Update combo
router.put(
  "/:comboId",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"]),
  uploadToCloudinary("service-combos").single("photo"),
  updateServiceCombo
);

// Get all combos
router.get("/", getAllServiceCombos);

// Get combo by ID
router.get("/:comboId", getServiceComboById);

// Delete combo
router.delete(
  "/:comboId",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"]),
  deleteServiceCombo
);

export default router;
