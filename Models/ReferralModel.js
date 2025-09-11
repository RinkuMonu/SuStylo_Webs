import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    // Kisne referral kiya
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "referrerModel",
    },
    referrerModel: {
      type: String,
      enum: ["User", "Admin"], // User = Customer, Admin = Salon Owner / Freelancer
      required: true,
    },

    // Kisko referral mila
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "refereeModel",
    },
    refereeModel: {
      type: String,
      enum: ["User", "Admin"],
      required: true,
    },

    // Reward amount (fixed, not percentage)
    rewardAmount: { type: Number, required: true },

    // Status of referral
    status: {
      type: String,
      enum: ["pending", "approved", "rewarded", "cancelled"],
      default: "pending",
    },

    // Payment / Wallet integration (future)
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

    // Metadata
    referralCode: { type: String, unique: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", ReferralSchema);

export default Referral;
