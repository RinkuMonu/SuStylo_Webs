// import mongoose from "mongoose";

// const attendanceSchema = new mongoose.Schema(
//   {
//     staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
//     salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
//     freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

//     date: { type: Date, required: true },
//     markIn: { type: Date },
//     markOut: { type: Date },

//     status: {
//       type: String,
//       enum: ["present", "absent", "half_day", "leave", "holiday"],
//       default: "present",
//     },

//     notes: { type: String, trim: true },
//     markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // who marked attendance
//   },
//   { timestamps: true }
// );

// const Attendance = mongoose.model("Attendance", attendanceSchema);
// export default Attendance;


import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },

    date: { type: Date, required: true },
    markIn: { type: Date },
    markOut: { type: Date },

    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave", "holiday"],
      default: "present",
    },

    isCompleted: {
  type: Boolean,
  default: false, // markOut hone ke baad true
},

    notes: { type: String, trim: true },

    // 🔹 Dynamic reference for staff/admin
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "markedByModel",
    },
    markedByModel: {
      type: String,
      required: true,
      enum: ["Staff", "Admin"], // only these two models
    },
  },
  { timestamps: true }
);

// Ensure only one attendance per staff per date
attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;

