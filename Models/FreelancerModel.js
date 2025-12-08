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
    slug: {
      type: String,
      unique: true,
      index: true
    },

    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },

    // Contact details
    contact: {
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
      website: { type: String, trim: true },
    },

    // Address details
    address: {
      street: { type: String, trim: true },
      area: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      pinCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
    },

    experience: { type: Number, default: 0 }, // years of experience


    // Services & Staff
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },

    photos: [{ type: String }],
    agreementDocs: [{ type: String }],
    facilities: [{ type: String }],

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
