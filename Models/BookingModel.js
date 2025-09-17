import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingType: {
      type: String,
      enum: ["preBooking", "urgentBooking"],
      required: true,
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // freelancer is Admin type

    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

    services: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],

    comboId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCombo" },
    

    schedule: {
      date: { type: Date, required: true },
      slot: { type: String, required: true }, // "10:00 AM"
      duration: { type: Number, default: 60 }, // minutes
      chair: { type: Number },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number] }, // [lng, lat]
        address: { type: String },
      },
    },

    // Financials
    baseAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    transportCharges: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Payment
    paymentType: { type: String, enum: ["wallet", "UPI", "cash"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    transactionId: { type: String },
    walletTransaction: { type: mongoose.Schema.Types.ObjectId, ref: "WalletTransaction" },

    // Booking status
    status: {
      type: String,
      enum: [
        "pending",     // request received
        "onHold",      // slot hold (waiting for payment)
        "approved",    // salon/admin approved
        "rejected",
        "confirmed",   // confirmed with payment
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

    cancellationReason: { type: String },
    refundAmount: { type: Number, default: 0 },

    isRated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
