import express from "express";
import { authenticateAndAuthorize } from "./middlewares/authRoleMiddleware.js";

const router = express.Router();

// Route for super admin only
router.get(
    "/super-admin-dashboard",
    authenticateAndAuthorize(["superAdmin"], { forbiddenMsg: "Only Super Admins can access this route!" }),
    (req, res) => {
        res.send(`Welcome Super Admin: ${req.user.name}`);
    }
);

// Route for admin and super admin
router.get(
    "/admin-dashboard",
    authenticateAndAuthorize(["admin", "superAdmin"], { forbiddenMsg: "Admins only!" }),
    (req, res) => {
        res.send(`Welcome Admin or Super Admin: ${req.user.name}`);
    }
);

// Route for salon owner, freelancer, and super admin
router.get(
    "/manage-services",
    authenticateAndAuthorize(["salonOwner", "freelancer", "superAdmin"], { forbiddenMsg: "You cannot manage services" }),
    (req, res) => {
        res.send(`Manage your services: ${req.user.name}`);
    }
);

// Accessible by any authenticated user
router.get("/profile", authenticateAndAuthorize([], { unauthorizedMsg: "Please login to access profile" }), (req, res) => {
    res.send(`Your profile: ${req.user.name} (${req.user.role})`);
});

export default router;