const scheduleSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },

    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },

    isOpen: { type: Boolean, default: true },

    openingTime: { type: String, required: true }, // e.g., "09:00 AM"
    closingTime: { type: String, required: true }, // e.g., "09:00 PM"

    // ✅ Slots
    slots: [
      {
        time: { type: String, required: true }, // "11:00 AM"
        status: { type: String, enum: ["available", "booked"], default: "available" },
        chair: { type: Number }, // assigned chair number
      },
    ],

    // ✅ Holidays / special off days
    holiday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
