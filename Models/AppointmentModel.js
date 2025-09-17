import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },

    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },

    schedule: {
      date: { type: Date, required: true },
      slot: { type: String, required: true },
      chair: { type: Number },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "inProgress", "completed", "cancelled", "noShow"],
      default: "pending",
    },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
