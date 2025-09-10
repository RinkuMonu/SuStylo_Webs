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

    // ✅ Slots
    slots: [
      {
        time: { type: String, required: true },
        status: { type: String, enum: ["available", "booked"], default: "available" },
        chair: { type: Number },
      },
    ],

    holiday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
