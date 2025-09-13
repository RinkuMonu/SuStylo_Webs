import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    // Lead submit kisne kiya (usually User of type "salon" or "freelancer")
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },

    // Owner / Freelancer name
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    // Lead ka type: Salon ya Freelancer
    leadType: {
      type: String,
      enum: ["Salon", "Freelancer"],
      required: true,
    },

    // If Salon lead
    salonName: { type: String, trim: true },

    email: { type: String, required: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, "Invalid email"] },
    contact: { type: String, required: true, trim: true },

    // Address (common for both Salon & Freelancer)
    address: {
      street: { type: String, trim: true },
      area: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pinCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], index: "2dsphere" }, // [lng, lat]
      },
    },

    // Service area description (like "Jaipur City", "Home visits")
    serviceArea: { type: String, trim: true },

    // Services list (basic string, later can be replaced with Service IDs)
    servicesOffered: [{ type: String }],

    // Lead status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Approval details
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // SuperAdmin/ Admin
      default: null,
    },
    approvedAt: { type: Date },

    // If lead converted → reference to actual Salon/Freelancer doc
    convertedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "leadType", // either "Salon" or "Freelancer"
      default: null,
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
