import Booking from "../Models/BookingModel.js";
import Staff from "../Models/StaffModel.js";

export const getBookingHistory = async (req, res) => {
  try {
    let bookings;
    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      bookings = await Booking.find().populate("userId salonId freelancerId staffId services.serviceId");
    } else if (req.user.role === "Salon") {
      bookings = await Booking.find({ salonId: req.user.salonId }).populate("userId staffId services.serviceId");
    } else if (req.user.role === "Staff") {
      // for staff, show only bookings assigned to this staff
      bookings = await Booking.find({ staffId: req.user.staffId }).populate("userId salonId services.serviceId");
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("userId salonId freelancerId staffId services.serviceId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (
      ["SuperAdmin", "Admin"].includes(req.user.role) ||
      (req.user.role === "Salon" && String(booking.salonId) === String(req.user.salonId)) ||
      (req.user.role === "Staff" && String(booking.staffId) === String(req.user.staffId))
    ) {
      res.json({ success: true, booking });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
