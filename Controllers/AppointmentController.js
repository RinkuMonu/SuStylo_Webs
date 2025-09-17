import Appointment from "../Models/AppointmentModel.js";
import Salon from "../Models/SalonModel.js";
import Staff from "../Models/StaffModel.js";


// export const createAppointment = async (req, res) => {
//   try {
//     const { bookingId, userId, staffId, serviceId, salonId, schedule, notes } = req.body;

//     if (req.user.role === "admin") {
//       // salon owner → check if salonId matches
//       if (String(req.user.salonId) !== String(salonId)) {
//         return res.status(403).json({ success: false, message: "Unauthorized to create for other salon" });
//       }
//     }

//     if (req.user.role === "freelancer") {
//       // freelancer → staffId & salonId ignore
//       const appointment = await Appointment.create({
//         bookingId,
//         userId,
//         freelancerId: req.user._id,
//         serviceId,
//         schedule,
//         notes,
//       });
//       return res.status(201).json({ success: true, appointment });
//     }

//     const appointment = await Appointment.create({
//       bookingId,
//       userId,
//       staffId,
//       serviceId,
//       salonId,
//       schedule,
//       notes,
//     });

//     res.status(201).json({ success: true, appointment });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const createAppointment = async (req, res) => {
  try {
    const { bookingId, userId, staffId, serviceId, salonId, freelancerId, schedule, notes } = req.body;

    if (req.user.role === "super_admin") {
      // super admin must specify salonId or freelancerId
      if (!salonId && !freelancerId) {
        return res.status(400).json({ success: false, message: "salonId or freelancerId is required" });
      }

      const appointment = await Appointment.create({
        bookingId,
        userId,
        staffId: salonId ? staffId : undefined, // staff allowed only for salon
        serviceId,
        salonId,
        freelancerId,
        schedule,
        notes,
      });
      return res.status(201).json({ success: true, appointment });
    }

    if (req.user.role === "admin") {
      // salon owner → salonId from token
      const appointment = await Appointment.create({
        bookingId,
        userId,
        staffId, // staff required
        serviceId,
        salonId: req.user.salonId, // token se lelo
        schedule,
        notes,
      });
      return res.status(201).json({ success: true, appointment });
    }

    if (req.user.role === "freelancer") {
      // freelancer → staffId ignore
      const appointment = await Appointment.create({
        bookingId,
        userId,
        serviceId,
        freelancerId: req.user._id, // token se lelo
        schedule,
        notes,
      });
      return res.status(201).json({ success: true, appointment });
    }

    return res.status(403).json({ success: false, message: "Unauthorized role to create appointment" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("userId staffId serviceId salonId freelancerId", "name email salonName serviceName");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAllAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (startDate && endDate) {
      filter["schedule.date"] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (req.user.role === "admin") {
      filter.salonId = req.user.salonId;
    }
    if (req.user.role === "freelancer") {
      filter.freelancerId = req.user._id;
    }

    const appointments = await Appointment.find(filter)
      .populate("userId staffId serviceId salonId freelancerId", "name email salonName serviceName")
      .sort({ "schedule.date": -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAppointmentsByStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    if (req.user.role === "admin" && String(staff.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Unauthorized for other salon staff" });
    }

    const appointments = await Appointment.find({ staffId: staff._id })
      .populate("userId staffId serviceId salonId", "name salonName serviceName")
      .sort({ "schedule.date": -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role === "user" && String(req.user._id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized to view other user's appointments" });
    }

    const appointments = await Appointment.find({ userId })
      .populate("staffId serviceId salonId freelancerId", "name salonName serviceName")
      .sort({ "schedule.date": -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (req.user.role === "admin" && String(appointment.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Unauthorized to update other salon's appointment" });
    }
    if (req.user.role === "freelancer" && String(appointment.freelancerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized to update other freelancer's appointment" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (req.user.role === "admin" && String(appointment.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Unauthorized to reschedule other salon's appointment" });
    }
    if (req.user.role === "freelancer" && String(appointment.freelancerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized to reschedule other freelancer's appointment" });
    }

    appointment.schedule = schedule;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateAppointmentNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (req.user.role === "user" && String(appointment.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized to update notes for other user's appointment" });
    }

    appointment.notes = notes;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (req.user.role === "admin" && String(appointment.salonId) !== String(req.user.salonId)) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete other salon's appointment" });
    }
    if (req.user.role === "freelancer" && String(appointment.freelancerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete other freelancer's appointment" });
    }

    await appointment.deleteOne();
    res.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
