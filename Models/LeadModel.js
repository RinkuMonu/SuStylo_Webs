const mongoose = require("mongoose");

const salonLeadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who is registering
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    // Type of lead: Salon Owner OR Freelancer
    leadType: {
      type: String,
      enum: ["Salon", "Freelancer"],
      required: true,
    },

    // Salon Details (only required if leadType = "Salon")
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

    // Freelancer-specific fields
    serviceArea: {
      type: String, // e.g., "Jaipur city", "Within 10km"
      trim: true,
    },

    servicesOffered: [
      {
        type: String, // e.g., "Haircut", "Makeup", "Facial"
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

module.exports = mongoose.model("SalonLead", salonLeadSchema);
