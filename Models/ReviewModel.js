const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewFor: {
      type: String,
      enum: ["Salon", "Freelancer", "Staff"], // kis ke liye review hai
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "reviewFor", // 🔹 dynamic reference (Salon / Freelancer / Staff)
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      trim: true,
    },

    editedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔹 Har user ek hi entity pr ek review de (Salon/Freelancer/Staff)
reviewSchema.index({ reviewFor: 1, targetId: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
