import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    date: { type: Date, required: true },
    markIn: { type: Date },
    markOut: { type: Date },
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave"],
      default: "present",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", AttendanceSchema);

export default Attendance;
