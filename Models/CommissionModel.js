import mongoose from "mongoose";

const CommissionSchema = new mongoose.Schema(
  {
    // Kis booking par commission apply hua
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // Kis admin/freelancer/salon ke liye commission kata
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Salon Owner / Freelancer
      required: true,
    },

    // Commission details
    commissionPercentage: { type: Number, required: true }, // e.g. 10%
    commissionAmount: { type: Number, required: true }, // actual money deducted

    // Payment / Wallet integration
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "deducted", "refunded"],
      default: "pending",
    },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Commission = mongoose.model("Commission", CommissionSchema);

export default Commission;
