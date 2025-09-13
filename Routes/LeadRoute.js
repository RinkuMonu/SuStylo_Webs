// routes/leadRoutes.js
import express from "express";
import * as leadCtrl from "../Controllers/LeadController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js"; // your provided middleware
import { ADMIN_ROLES } from "../Models/AdminModal.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js"; // your multer/cloudinary helper

const router = express.Router();

router.post("/", leadCtrl.createLead);

router.get("/", authenticateAndAuthorize([ADMIN_ROLES.SUPER_ADMIN], { forbiddenMsg: "Only Super Admins can view leads" }), leadCtrl.listLeads);

router.get("/:id", authenticateAndAuthorize([ADMIN_ROLES.SUPER_ADMIN], { forbiddenMsg: "Only Super Admins can view lead" }), leadCtrl.getLead);

router.post("/:id/approve", authenticateAndAuthorize([ADMIN_ROLES.SUPER_ADMIN], { forbiddenMsg: "Only Super Admins can approve leads" }), uploadToCloudinary("salons").single("document"), leadCtrl.approveLead);

router.post("/:id/reject", authenticateAndAuthorize([ADMIN_ROLES.SUPER_ADMIN], { forbiddenMsg: "Only Super Admins can reject leads" }), leadCtrl.rejectLead);

export default router;
