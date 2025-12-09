import Cart from "../Models/CartModel.js";
import Service from "../Models/ServicesModel.js";
import ServiceCombo from "../Models/ComboModel.js";

export const calculateTotal = (cart) => {
  let total = 0;
  cart.items.forEach((i) => {
    total += i.price * i.quantity;
  });
  cart.totalAmount = total;
  return cart;
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    for (const item of items) {
      let { serviceId, comboId, quantity = 1, salonId, freelancerId } = item;
      if (!serviceId && !comboId) continue;

      let price = 0;

      // ✅ Service price
      if (serviceId) {
        const service = await Service.findById(serviceId);
        if (!service) continue;
        price = service.discountPrice || service.price;
      }

      // ✅ Combo price
      if (comboId) {
        const combo = await ServiceCombo.findById(comboId);
        if (!combo) continue;
        price = combo.basePrice;
      }

      // ✅ ENSURE ONLY ONE PROVIDER
      if (salonId) freelancerId = null;
      if (freelancerId) salonId = null;

      const existing = cart.items.find(i =>
        String(i.serviceId || "") === String(serviceId || "") &&
        String(i.comboId || "") === String(comboId || "") &&
        String(i.salonId || "") === String(salonId || "") &&
        String(i.freelancerId || "") === String(freelancerId || "")
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({
          serviceId: serviceId || null,
          comboId: comboId || null,
          salonId: salonId || null,
          freelancerId: freelancerId || null,
          price,
          quantity,
        });
      }
    }

    cart.totalAmount = cart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId })
      .populate("items.serviceId")
      .populate("items.comboId")
      .populate("items.salonId")
      .populate("items.freelancerId");

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body; // array of items to update

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // helper matcher (handles null properly)
    const isSameItem = (cartItem, payloadItem) => {
      return (
        String(cartItem.serviceId || "") === String(payloadItem.serviceId || "") &&
        String(cartItem.comboId || "") === String(payloadItem.comboId || "") &&
        String(cartItem.salonId || "") === String(payloadItem.salonId || "") &&
        String(cartItem.freelancerId || "") === String(payloadItem.freelancerId || "")
      );
    };

    // update each item
    for (const payloadItem of items) {
      const { quantity } = payloadItem;
      if (quantity === undefined) continue;

      const cartItem = cart.items.find(ci =>
        isSameItem(ci, payloadItem)
      );

      if (cartItem) {
        cartItem.quantity = quantity;

        // remove if qty <= 0
        if (cartItem.quantity <= 0) {
          cart.items = cart.items.filter(i => i._id.toString() !== cartItem._id.toString());
        }
      }
    }

    // recalc total
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    res.json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });

  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);

    calculateTotal(cart);
    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.findOneAndDelete({ userId });

    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
