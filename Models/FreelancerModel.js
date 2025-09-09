const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    // ✅ Reference to Services Schema
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    // ✅ Reference to Staff/Employee Schema
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
    ],

    // ✅ Location (for nearby search)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },

    // ✅ Transport & reach details
    transportCharge: {
      type: Number,
      default: 0, // like delivery charges in e-commerce
    },
    averageReachTime: {
      type: Number, // minutes to reach customer location
      default: 30,
    },

    // ✅ Booking rules
    bookingTypes: {
      preBooking: { type: Boolean, default: true },
      urgentBooking: { type: Boolean, default: true },
    },

    // ✅ Status flags
    isActive: {
      type: Boolean,
      default: false, // if false → no booking alerts
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // ✅ Ratings & reviews
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Freelancer", freelancerSchema);
