import mongoose from "mongoose";

const { Schema } = mongoose;

const payoutSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    trans_mode: {
      type: String,
    },
    account: {
      type: String,
    },
    ifsc: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    description: { type: String },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Failed"],
      default: "Pending",
    },
    txn_id: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    utr: {
      type: String,
    },
    adminAction: {
      type: String,
    },
    remark: {   // ✅ spelling fix (pehle "reamrk" tha)
      type: String,
    },
  }
);

const Payout = mongoose.model("Payout", payoutSchema);

export default Payout;