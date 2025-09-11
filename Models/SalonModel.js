import mongoose from "mongoose";

const salonSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    salonName: { type: String, required: true, trim: true },
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
    },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },

    photos: [{ type: String }],
    agreementDocs: [{ type: String }],

    facilities: [{ type: String }],

    chairCount: { type: Number, default: 1 },
    chairs: [
      {
        number: { type: Number },
        status: { type: String, enum: ["available", "booked"], default: "available" },
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

    // 🔗 Referral integration
    referrals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Referral",
      },
    ],

    // 🔗 Commission integration
    commission: {
      isCommissionApplicable: { type: Boolean, default: true }, // enable/disable
      percentage: { type: Number, default: 10 }, // default 10%
      commissionsHistory: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Commission",
        },
      ],
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Salon = mongoose.model("Salon", salonSchema);

export default Salon;
