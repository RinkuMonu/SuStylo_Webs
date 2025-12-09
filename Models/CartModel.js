import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    // Service / Combo
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },
    comboId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCombo",
      default: null,
    },

    // ✅ Provider (ONLY ONE SHOULD EXIST)
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      default: null,
    },

    // Pricing
    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ ONE CART PER USER
    },

    items: [cartItemSchema],

    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * ✅ Safety Rule
 * Ensure item has ONLY salonId OR freelancerId
 */
cartSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    if (item.salonId && item.freelancerId) {
      item.freelancerId = null; // prefer salon
    }
  });
  next();
});

export default mongoose.model("Cart", cartSchema);
