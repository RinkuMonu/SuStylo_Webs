// import Attendance from "../Models/AttendanceModel.js";
// import Staff from "../Models/StaffModel.js";

// export const markAttendance = async (req, res) => {
//   try {
//     const { staffId, date, markIn, markOut, status, notes } = req.body;

//     // check permissions
//     let salonIdOfStaff;
//     const staff = await Staff.findById(staffId);
//     if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
//     salonIdOfStaff = staff.salonId;

//     if (
//       ["super_admin", "admin"].includes(req.user.role) ||
//       (req.user.role === "Salon" && String(salonIdOfStaff) === String(req.user.salonId))
//     ) {
//       const attendance = await Attendance.create({
//         staffId,
//         salonId: salonIdOfStaff,
//         date,
//         markIn,
//         markOut,
//         status,
//         notes,
//         markedBy: req.user._id,
//       });
//       res.status(201).json({ success: true, attendance });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getAttendanceByStaff = async (req, res) => {
//   try {
//     const staffId = req.params.staffId;
//     const staff = await Staff.findById(staffId);
//     if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

//     if (
//       ["super_admin", "admin"].includes(req.user.role) ||
//       (req.user.role === "Salon" && String(staff.salonId) === String(req.user.salonId))
//     ) {
//       const attendances = await Attendance.find({ staffId }).sort({ date: -1 });
//       res.json({ success: true, attendances });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getAllAttendances = async (req, res) => {
//   try {
//     if (["super_admin", "admin"].includes(req.user.role)) {
//       const attendances = await Attendance.find().populate("staffId salonId");
//       return res.json({ success: true, attendances });
//     }
//     if (req.user.role === "Salon") {
//       const attendances = await Attendance.find({ salonId: req.user.salonId }).populate("staffId");
//       return res.json({ success: true, attendances });
//     }
//     return res.status(403).json({ success: false, message: "Forbidden" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




import Attendance from "../Models/AttendanceModel.js";
import Staff from "../Models/StaffModel.js";

// Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { staffId, date, markIn, markOut, status, notes } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    // check duplicate attendance
    const existing = await Attendance.findOne({
      staffId,
      date: new Date(date).toISOString(),
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Attendance already marked for this staff on this date" });
    }

    let markedBy, markedByModel;

    // Staff marking own attendance
    if (req.user.role === "staff" && String(req.user._id) === String(staffId)) {
      markedBy = req.user._id;
      markedByModel = "Staff";
    }
    // Admin marking for their own staff
    else if (req.user.role === "admin" && String(req.user.salonId) === String(staff.salonId)) {
      markedBy = req.user._id;
      markedByModel = "Admin";
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized to mark attendance" });
    }

    const attendance = await Attendance.create({
      staffId,
      salonId: staff.salonId,
      date,
      markIn,
      markOut,
      status,
      notes,
      markedBy,
      markedByModel,
    });

    res.status(201).json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Attendance by Staff
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

// Get All Attendances
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

