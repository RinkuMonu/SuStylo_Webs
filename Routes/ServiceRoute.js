import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategory,
} from "../Controllers/ServiceController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";


const router = express.Router();


router.post(
  "/",
  authenticateAndAuthorize(["super_admin", "admin", "Freelancer"]),
  uploadToCloudinary("services").single("image"), // ⬅️ store in "services" folder
  createService
);

router.get(
  "/",
  getAllServices
);

router.get(
  "/:id",
  getServiceById
);


router.put(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "Freelancer"]),
  uploadToCloudinary("services").single("image"),
  updateService
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "Freelancer"], { forbiddenMsg: "Not allowed" }),
  deleteService
);

// Get services by category
router.get(
  "/category/:categoryId",
  getServicesByCategory
);


export default router;
