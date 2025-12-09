import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeItem,
  clearCart,
} from "../Controllers/CartController.js";
import { authenticateAndAuthorize } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/add", authenticateAndAuthorize(["customer"]), addToCart);

router.get("/", authenticateAndAuthorize(["customer"]), getCart);

router.put("/update-quantity", authenticateAndAuthorize(["customer"]), updateCartQuantity);

router.delete("/remove/:itemId", authenticateAndAuthorize(["customer"]), removeItem);

router.delete("/clear", authenticateAndAuthorize(["customer"]), clearCart);

export default router;
