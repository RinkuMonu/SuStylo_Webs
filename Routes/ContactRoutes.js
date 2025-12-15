import express from "express";
import {
    createContact,
    getAllContacts,
    getContactById,
    deleteContact,
} from "../Controllers/ContactController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// 🔹 Public Route (anyone can submit contact form)
router.post("/", createContact);

// 🔹 Admin Routes
router.get(
  "/all",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"], { forbidden: "Forbidden!" }),
  getAllContacts
);

router.get(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"]),
  getContactById
);

router.delete(
  "/:id",
  authenticateAndAuthorize(["super_admin", "admin", "freelancer"]),
  deleteContact
);

export default router;
