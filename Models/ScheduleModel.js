import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    // freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },

    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },

    isOpen: { type: Boolean, default: true },
    openingTime: { type: String, required: false }, // "09:00"
    closingTime: { type: String, required: false }, // "18:00"

    repeatType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "none"],
      default: "daily",
    },

    slots: [
      {
        time: { type: String, required: true }, // "10:00 AM"
        status: { type: String, enum: ["available", "booked"], default: "available" },
        staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        chairNumber: { type: Number },
      },
    ],

    holiday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
