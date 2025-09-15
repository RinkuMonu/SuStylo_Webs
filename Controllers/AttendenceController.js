import Attendance from "../Models/AttendanceModel.js";
import Staff from "../Models/StaffModel.js";

export const markAttendance = async (req, res) => {
  try {
    const { staffId, date, markIn, markOut, status, notes } = req.body;

    // check permissions
    let salonIdOfStaff;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    salonIdOfStaff = staff.salonId;

    if (
      ["SuperAdmin", "Admin"].includes(req.user.role) ||
      (req.user.role === "Salon" && String(salonIdOfStaff) === String(req.user.salonId))
    ) {
      const attendance = await Attendance.create({
        staffId,
        salonId: salonIdOfStaff,
        date,
        markIn,
        markOut,
        status,
        notes,
        markedBy: req.user._id,
      });
      res.status(201).json({ success: true, attendance });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttendanceByStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    if (
      ["SuperAdmin", "Admin"].includes(req.user.role) ||
      (req.user.role === "Salon" && String(staff.salonId) === String(req.user.salonId))
    ) {
      const attendances = await Attendance.find({ staffId }).sort({ date: -1 });
      res.json({ success: true, attendances });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllAttendances = async (req, res) => {
  try {
    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      const attendances = await Attendance.find().populate("staffId salonId");
      return res.json({ success: true, attendances });
    }
    if (req.user.role === "Salon") {
      const attendances = await Attendance.find({ salonId: req.user.salonId }).populate("staffId");
      return res.json({ success: true, attendances });
    }
    return res.status(403).json({ success: false, message: "Forbidden" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
