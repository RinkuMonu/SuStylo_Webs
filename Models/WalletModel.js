// models/Wallet.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["online", "cash", "manual"], default: "online" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    description: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, refPath: "ownerModel", required: true },
    ownerModel: { type: String, enum: ["Salon", "Freelancer"], required: true },

    balance: { type: Number, default: 0 }, // usable balance
    cashPending: { type: Number, default: 0 }, // unpaid cash amount from customers
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
