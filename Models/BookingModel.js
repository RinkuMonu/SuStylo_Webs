import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingType: { type: String, enum: ["preBooking", "urgentBooking"], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

    services: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],

    comboId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCombo" },

    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },

    // Financials
    baseAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    transportCharges: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Commission
    commissionAmount: { type: Number, default: 0 }, // total commission for this booking
    salonCommission: { type: Number, default: 0 },
    freelancerCommission: { type: Number, default: 0 },
    approvedPrice: { type: Number }, // updated by salon/freelancer during approval

    // Payment
    paymentType: { type: String, enum: ["wallet", "cash"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    transactionId: { type: String },
    walletTransaction: { type: mongoose.Schema.Types.ObjectId, ref: "WalletTransaction" },

    // Booking status
    status: {
      type: String,
      enum: [
        "pending",        // request received
        "pendingApproval",// waiting for salon/freelancer approval
        "approved",       // approved by provider
        "rejected",
        "confirmed",      // confirmed with payment
        "inProgress",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    // Event-based booking
    event: {
      isEvent: { type: Boolean, default: false },
      eventType: { type: String, enum: ["wedding", "party", "corporate", "festival", "other"] },
      peopleCount: { type: Number },
      extraNotes: { type: String },
    },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Cancellation & Refund
    cancellationReason: { type: String },
    refundAmount: { type: Number, default: 0 },
    refundHistory: [
      {
        amount: { type: Number },
        refundedTo: { type: String }, // "user" or "wallet"
        date: { type: Date, default: Date.now },
        description: { type: String },
      },
    ],

    isRated: { type: Boolean, default: false },

    // Additional
    isAtHome: { type: Boolean, default: false }, // flag for at-home booking
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
