import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ReferralSchema = new mongoose.Schema(
  {
    // Kisne refer kiya
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },

    // Kisko refer hua
    referredTo: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },

    // Referral reward amount
    rewardAmount: { type: Number, default: 100 },


    status: {
      type: String,
      enum: ["pending", "partial_rewarded", "fully_rewarded", "cancelled"],
      default: "pending",
    },

    // Wallet Transaction 
    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet.transactions",
      default: null,
    },

    // Auto-generated referral code (per referral entry)
    referralCode: {
      type: String,
      unique: true,
      default: () => uuidv4().slice(0, 8), // 8 char unique code
    },

    notes: { type: String, trim: true },

    // 🔹 Only for global setting doc
    isGlobalSetting: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", ReferralSchema);
export default Referral;
