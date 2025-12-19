

import Appointment from "../Models/AppointmentModel.js";
import Staff from "../Models/StaffModel.js";
import Booking from "../Models/BookingModel.js";


// ✅ Assign (Create Appointment)
export const assignAppointment = async (req, res) => {
  try {
    const { bookingId, userId, staffId, schedule, notes } = req.body;

    // check staff belongs to this salon
    const staff = await Staff.findById(staffId);
    if (!staff || String(staff.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Staff not part of your salon" });
    }

    const appointment = await Appointment.create({
      bookingId,
      userId,
      staffId,
      salonId: req.user.salonId,
      schedule,
      notes,
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get All Appointments (Salon based)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ salonId: req.user.salonId })
      .populate("userId staffId bookingId", "name email fullName serviceName");

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get by Staff
export const getAppointmentsByStaff = async (req, res) => {
  try {
    console.log("ROLE:", req.user.role);
console.log("PARAM STAFF ID:", req.params.staffId);
console.log("TOKEN USER ID:", req.user._id);

    const staff = await Staff.findById(req.params.staffId);
    if (!staff || String(staff.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const appointments = await Appointment.find({ staffId: staff._id })
      .populate("userId bookingId", "name email serviceName");

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update Appointment (change staff, schedule, notes, status)
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (String(appointment.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // If staff changed, validate
    if (updates.staffId) {
      const staff = await Staff.findById(updates.staffId);
      if (!staff || String(staff.salonId) !== String(req.user.salonId)) {
        return res.status(403).json({ success: false, message: "Staff not part of your salon" });
      }
    }

    appointment = await Appointment.findByIdAndUpdate(id, updates, { new: true });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Cancel Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (String(appointment.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete Appointment (hard delete if required)
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (String(appointment.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await appointment.deleteOne();
    res.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
