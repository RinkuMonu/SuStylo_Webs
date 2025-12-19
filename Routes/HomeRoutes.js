import express from "express";
import { getHomeData } from "../Controllers/HomeController.js";

const router = express.Router();

router.get("/all-data", getHomeData);

export default router;