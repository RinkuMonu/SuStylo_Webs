import mongoose from "mongoose";

const salonLeadSchema = new mongoose.Schema(
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

    salonName: {
      type: String,
      trim: true,
    },

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

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SalonLead = mongoose.model("SalonLead", salonLeadSchema);

export default SalonLead;
