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

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },

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

    schedule: {
      date: { type: Date, required: true },
      slot: { type: String, required: true },
      duration: { type: Number, default: 60 },
      chair: { type: Number },
      location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String },
      },
    },

    baseAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    transportCharges: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

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
    transactionId: { type: String },
    walletTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "confirmed",
        "inProgress",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    event: {
      isEvent: { type: Boolean, default: false },
      eventType: {
        type: String,
        enum: ["wedding", "party", "corporate", "festival", "other"],
      },
      peopleCount: { type: Number },
      extraNotes: { type: String },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

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