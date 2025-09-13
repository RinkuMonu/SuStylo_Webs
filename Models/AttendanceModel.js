import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

    date: { type: Date, required: true },
    markIn: { type: Date },
    markOut: { type: Date },

    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave", "holiday"],
      default: "present",
    },

    notes: { type: String, trim: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // who marked attendance
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
