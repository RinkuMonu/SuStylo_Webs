import express from "express";
import { globalSearch } from "../Controllers/SearchController.js";

const router = express.Router();

// Public search endpoint
router.get("/", globalSearch);

export default router;
