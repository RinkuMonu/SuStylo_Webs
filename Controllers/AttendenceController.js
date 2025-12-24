import Attendance from "../Models/AttendanceModel.js";
import Staff from "../Models/StaffModel.js";

// export const markAttendance = async (req, res) => {
//   try {
//     const { staffId, date, markIn, markOut, status, notes } = req.body;

//     const staff = await Staff.findById(staffId);
//     if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

//     // check duplicate attendance
//     const existing = await Attendance.findOne({
//       staffId,
//       date: new Date(date).toISOString(),
//     });
//     if (existing) {
//       return res.status(400).json({ success: false, message: "Attendance already marked for this staff on this date" });
//     }

//     let markedBy, markedByModel;

//     // Staff marking own attendance
//     if (req.user.role === "staff" && String(req.user._id) === String(staffId)) {
//       markedBy = req.user._id;
//       markedByModel = "Staff";
//     }
//     // Admin marking for their own staff
//     else if (req.user.role === "admin" && String(req.user.salonId) === String(staff.salonId)) {
//       markedBy = req.user._id;
//       markedByModel = "Admin";
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized to mark attendance" });
//     }

//     const attendance = await Attendance.create({
//       staffId,
//       salonId: staff.salonId,
//       date,
//       markIn,
//       markOut,
//       status,
//       notes,
//       markedBy,
//       markedByModel,
//     });

//     res.status(201).json({ success: true, attendance });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const markAttendanceIn = async (req, res) => {
  try {
    const staffId = req.params.id;

    const staff = await Staff.findById(staffId);
    if (!staff)
      return res.status(404).json({ success: false, message: "Staff not found" });

    // 🔹 Today date normalize (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔒 Authorization
    let markedBy, markedByModel;

    if (req.user.role === "staff" && String(req.user.id) === String(staffId)) {
      markedBy = req.user.id;
      markedByModel = "Staff";
    } else if (
      req.user.role === "admin" &&
      String(req.user.salonId) === String(staff.salonId)
    ) {
      markedBy = req.user.id;
      markedByModel = "Admin";
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // ❗ Per-day check
    const existing = await Attendance.findOne({ staffId, date: today });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Mark In already done for today",
      });
    }
    

    const attendance = await Attendance.create({
      staffId,
      salonId: staff.salonId,
      date: today,
      markIn: new Date(), // ⏱ auto current time
      status: "present",
      markedBy,
      markedByModel,
    });

    res.status(201).json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAttendanceOut = async (req, res) => {
  try {
    const staffId = req.params.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ staffId, date: today });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Mark In not found for today",
      });
    }

    if (attendance.markOut) {
      return res.status(400).json({
        success: false,
        message: "Mark Out already done",
      });
    }

    // 🔒 Authorization
    if (
      req.user.role === "staff" &&
      String(req.user.id) !== String(staffId)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (
      req.user.role === "admin" &&
      String(req.user.salonId) !== String(attendance.salonId)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    attendance.markOut = new Date(); // ⏱ auto time
    attendance.isCompleted = true;
    attendance.status = "present";

    await attendance.save();

    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttendanceByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    // Permissions
    if (
      req.user.role === "super_admin" ||
      (req.user.role === "admin" && String(req.user.salonId) === String(staff.salonId)) ||
      (req.user.role === "staff" && String(req.user._id) === String(staffId))
    ) {
      const attendances = await Attendance.find({ staffId })
        .sort({ date: -1 })
        .populate("markedBy", "name role"); // works for both Staff & Admin
      return res.json({ success: true, attendances });
    }

    return res.status(403).json({ success: false, message: "Unauthorized to view attendance" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllAttendances = async (req, res) => {
  try {
    let attendances;

    if (req.user.role === "super_admin") {
      attendances = await Attendance.find()
        .populate("staffId salonId")
        .populate("markedBy", "name role")
        .sort({ date: -1 });
    } else if (req.user.role === "admin") {
      attendances = await Attendance.find({ salonId: req.user.salonId })
        .populate("staffId")
        .populate("markedBy", "name role")
        .sort({ date: -1 });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized to view attendances" });
    }

    return res.json({ success: true, attendances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

