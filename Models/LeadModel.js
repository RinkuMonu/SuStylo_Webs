import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    leadType: {
      type: String,
      enum: ["Salon", "Freelancer"],
      required: true,
    },

    // Only applicable if leadType is Salon
    salonName: {
      type: String,
      trim: true,
    },

    // Address applicable for both
    address: {
      street: { type: String, trim: true },
      area: { type: String, trim: true },
      pinCode: { type: String, trim: true },
      city: { type: String, trim: true },
    },

    serviceArea: {
      type: String,
      trim: true,
    },

    servicesOffered: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Super admin ID
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;