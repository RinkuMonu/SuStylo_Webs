import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../Controllers/ServiceController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";


const router = express.Router();

// router.post(
//   "/",
//   authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon", "Freelancer"], { forbiddenMsg: "Not allowed to create service" }),
//   createService
// );

router.post(
  "/",
  authenticateAndAuthorize(["super_admin", "Admin", "Salon", "Freelancer"]),
  uploadToCloudinary("services").single("image"), // ⬅️ store in "services" folder
  createService
);

router.get(
  "/",
  // authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon", "Freelancer"], { forbiddenMsg: "Not allowed to view services" }),
  getAllServices
);

router.get(
  "/:id",
  // authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon", "Freelancer"], { forbiddenMsg: "Not allowed" }),
  getServiceById
);

// router.put(
//   "/:id",
//   authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon", "Freelancer"], { forbiddenMsg: "Not allowed" }),
//   updateService
// );


router.put(
  "/:id",
  authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon", "Freelancer"]),
  uploadToCloudinary("services").single("image"),
  updateService
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["SuperAdmin", "Admin", "Salon", "Freelancer"], { forbiddenMsg: "Not allowed" }),
  deleteService
);

export default router;
