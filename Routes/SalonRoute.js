import express from "express";
import {
  createSalon,
  getAllSalons,
  getSalonById,
  updateSalon,
  deleteSalon,
  addService,
  addSchedule,
} from "../Controllers/Salon.js";

import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Salon CRUD
router.post(
  "/",
  authenticateAndAuthorize(["owner", "superadmin"]),
  uploadToCloudinary("salon").fields([
    { name: "photos", maxCount: 5 },
    { name: "agreementDocs", maxCount: 3 },
  ]),
  createSalon
);

router.get("/", getAllSalons);
router.get("/:id", getSalonById);
router.put(
  "/:id",
  authenticateAndAuthorize(["owner", "superadmin"]),
  uploadToCloudinary("salon").fields([
    { name: "photos", maxCount: 5 },
    { name: "agreementDocs", maxCount: 3 },
  ]),
  updateSalon
);
router.delete("/:id", authenticateAndAuthorize(["superadmin"]), deleteSalon);

// Services
router.post("/:id/services", authenticateAndAuthorize(["owner", "superadmin"]), addService);

// Schedule
router.post("/:id/schedules", authenticateAndAuthorize(["owner", "superadmin"]), addSchedule);

export default router;