import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["online", "cash", "manual", "referral"], default: "referral" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // referral-related user
    description: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, refPath: "ownerModel", required: true },
    ownerModel: { type: String, enum: ["User", "Salon", "Freelancer"], required: true },

    balance: { type: Number, default: 0 },
    cashPending: { type: Number, default: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;