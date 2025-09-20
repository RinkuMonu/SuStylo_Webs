import express from "express";

import { payIn, callbackPayIn, getPayInRes, payInReportAllUsers } from "../Controllers/PayinController.js";
import { payOut, adminAction, callbackPayout, payOutReportAllUsers } from "../Controllers/PayoutController.js";

const router = express.Router();

router.post("/payIn", payIn);
router.post("/payOut", payOut);
router.post("/payout/admin-action", adminAction);
router.get("/payIn/response", getPayInRes);
router.post("/payIn/callback", callbackPayIn);
router.post("/payOut/callback", callbackPayout);
router.get("/payIn/report", payInReportAllUsers);
router.get("/payOut/report", payOutReportAllUsers);

export default router;