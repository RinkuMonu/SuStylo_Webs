const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingType: {
      type: String,
      enum: ["preBooking", "urgentBooking"],
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Either Salon or Freelancer (mutually exclusive)
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: false,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: false,
    },

    // Assigned employee/staff
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },

    // Services OR Combo
    services: [
      {
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],

    combo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCombo",
      required: false,
    },

    // Schedule details
    schedule: {
      date: { type: Date, required: true },
      slot: { type: String, required: true }, // e.g. "11:00 AM"
      duration: { type: Number, default: 60 }, // in minutes
      chair: { type: Number }, // salon only
      location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String },
      },
    },

    // Pricing
    baseAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    transportCharges: { type: Number, default: 0 }, // freelancer only
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Payment Info
    paymentType: {
      type: String,
      enum: ["wallet", "UPI", "cash"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: { type: String }, // if UPI/online
    walletTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
    },

    // Booking Status Flow
    status: {
      type: String,
      enum: [
        "pending", // user created
        "approved", // salon/freelancer approved
        "rejected", // salon/freelancer rejected
        "confirmed", // payment done or cash selected
        "inProgress", // service started
        "completed", // service finished
        "cancelled", // user cancelled
        "refunded", // refund processed
      ],
      default: "pending",
    },

    // Event booking details (if applicable)
    event: {
      isEvent: { type: Boolean, default: false },
      eventType: {
        type: String,
        enum: ["wedding", "party", "corporate", "festival", "other"],
      },
      peopleCount: { type: Number },
      extraNotes: { type: String },
    },

    // Tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who booked (could be admin booking on behalf)
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // salon/freelancer owner or staff
    },

    // Audit & Tracking
    cancellationReason: { type: String },
    refundAmount: { type: Number, default: 0 },

    isRated: {
      type: Boolean,
      default: false,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);