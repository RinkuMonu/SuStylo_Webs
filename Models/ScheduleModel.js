import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },

    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },

    isOpen: { type: Boolean, default: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },

    repeatType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "none"],
      default: "none",
    },

    slots: [
      {
        time: { type: String, required: true }, // "10:00 AM"
        status: { type: String, enum: ["available", "booked"], default: "available" },
        chairs: [
          {
            chairNumber: { type: Number, required: true },
            staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
            status: { type: String, enum: ["available", "booked"], default: "available" },
          },
        ],
      },
    ],

    holiday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
