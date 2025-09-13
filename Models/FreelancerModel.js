import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User of role "freelancer"
      required: true,
    },

    leadRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead", // from which lead this freelancer was created
      default: null,
    },

    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },

    // Services & Staff
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },

    transportCharge: { type: Number, default: 0 },
    averageReachTime: { type: Number, default: 30 }, // minutes

    bookingTypes: {
      preBooking: { type: Boolean, default: true },
      urgentBooking: { type: Boolean, default: true },
    },

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

    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Referral" }],

    commission: {
      isCommissionApplicable: { type: Boolean, default: true },
      percentage: { type: Number, default: 10 },
      commissionsHistory: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Commission" },
      ],
    },
  },
  { timestamps: true }
);

const Freelancer = mongoose.model("Freelancer", freelancerSchema);
export default Freelancer;
