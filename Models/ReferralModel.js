import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    // Kisne refer kiya
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // user/customer
      required: true,
    },

    // Kisko refer hua
    referredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Referral ka reward (dynamic, super admin se controlled)
    rewardAmount: { type: Number, required: true },

    // Status
    status: {
      type: String,
      enum: ["pending", "rewarded", "cancelled"],
      default: "pending",
    },

    // Wallet Transaction Link
    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet.transactions",
      default: null,
    },

    referralCode: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", ReferralSchema);
export default Referral;
