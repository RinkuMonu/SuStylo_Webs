import mongoose from "mongoose";

const ticketReplySchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    attachments: [{ type: String }], // URLs of screenshots, documents

    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // could be customer, admin, staff
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "salon_owner", "freelancer", "staff", "admin", "super_admin"],
      required: true,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },

    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    category: {
      type: String,
      enum: [
        "booking_issue",
        "payment_issue",
        "refund_issue",
        "wallet_issue",
        "service_quality",
        "technical",
        "general",
      ],
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed", "rejected"],
      default: "open",
    },

    // 🔗 Relations
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // customer / freelancer / salonOwner
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // support staff or admin
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment", // jab aap payment schema banaoge
    },

    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction", // wallet schema me use hoga
    },

    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
    },

    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },

    replies: [ticketReplySchema],

    attachments: [{ type: String }], // initial issue proof

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
