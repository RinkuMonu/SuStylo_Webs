const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String, // URL or path to coupon banner
    },

    // Discount handling (either percentage or flat)
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // Usage & validity
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    minOrderAmount: {
      type: Number,
      default: 0, // coupon only applies if order >= this
    },

    maxDiscount: {
      type: Number,
      default: 0, // useful for percentage coupons (cap the discount)
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who created
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
