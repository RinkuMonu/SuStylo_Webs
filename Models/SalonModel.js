import mongoose from "mongoose";
import Referral from "../Models/ReferralModel.js";


const salonSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User of role "admin/salon"
      required: true,
    },

    leadRef: {

      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead", // from which lead this salon was created
      default: null,
    },

    salonName: { type: String, required: true, trim: true },
      slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
    description: { type: String, trim: true },

    contact: {
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
      website: { type: String, trim: true },
    },

    address: {
      street: { type: String, required: true, trim: true },
      area: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      pinCode: { type: String, required: true, trim: true },
      country: { type: String, trim: true, default: "India" },
    },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // [lng, lat]
    },

    photos: [{ type: String }],
    agreementDocs: [{ type: String }],
    // facilities: [{ type: String }],
    facilities: {
      type: [String],
      default: []
    },


    // Staff & Services
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],

    // Chairs management
    chairCount: { type: Number, default: 1 },
    chairs: [
      {
        number: { type: Number },
        status: {
          type: String,
          enum: ["available", "booked"],
          default: "available",
        },
      },
    ],

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isActive: { type: Boolean, default: false },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Referral" }],

    commission: {
      isCommissionApplicable: { type: Boolean, default: true },
      percentage: { type: Number, default: 10 },
      flat: { type: Number, default: 0 },
      commissionsHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Commission" }]
    }

  },
  { timestamps: true }
);


salonSchema.pre("save", function (next) {
  if (this.isModified("salonName")) {
    this.slug = this.salonName
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

const Salon = mongoose.model("Salon", salonSchema);
export default Salon;


salonSchema.pre("save", function (next) {
  if (this.isModified("salonName")) {
    this.slug = this.salonName
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});