import express from "express";
import {
    getWallet,
    addWalletBalance,
    debitWalletBalance,
} from "../Controllers/WalletController.js";

const router = express.Router();
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";


// Get wallet by ownerId
router.get("/:ownerId", authenticateAndAuthorize(["customer"]), getWallet);
// router.get("/:ownerId", getWallet);


// Admin – add money to wallet
router.post("/add", authenticateAndAuthorize(["customer"]), addWalletBalance);

// Admin – debit money from wallet
router.post("/debit", authenticateAndAuthorize(["customer"]), debitWalletBalance);

export default router;
