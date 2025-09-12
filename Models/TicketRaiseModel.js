import mongoose from "mongoose";

const ticketReplySchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    attachments: [{ type: String }],

    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "freelancer", "staff", "admin", "super_admin"],
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

    // 🔗 Who raised
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "freelancer", "staff", "admin", "super_admin"],
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🎯 Salon always required for customer & staff
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: function () {
        return this.role === "customer" || this.role === "staff";
      },
    },

    // Optional relations
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    walletTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "WalletTransaction" },

    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

    replies: [ticketReplySchema],
    attachments: [{ type: String }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
