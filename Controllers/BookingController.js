import Booking from "../Models/BookingModel.js";
import Coupon from "../Models/CouponModel.js"; // मान लो coupon schema है
import WalletTransaction from "../Models/WalletTransaction.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";
import mongoose from "mongoose";

export const createBooking = async (req, res) => {
  try {
    const userId = req.user?._id; // login check (auth middleware से आएगा)
    if (!userId) {
      return res.status(401).json({ message: "Please login to continue" });
    }

    const {
      bookingType,
      salonId,
      freelancerId,
      services,
      comboId,
      schedule,
      couponCode,
      transportCharges,
    } = req.body;

    // Base price निकालना (services + combo)
    let baseAmount = 0;
    services.forEach(s => {
      baseAmount += s.price * (s.quantity || 1);
    });

    // अगर combo है तो उसका price add
    if (comboId) {
      // मान लो ServiceCombo model है
      const combo = await mongoose.model("ServiceCombo").findById(comboId);
      if (combo) baseAmount += combo.basePrice;
    }

    let discountAmount = 0;

    // Coupon apply
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon) {
        discountAmount = (baseAmount * coupon.discountPercent) / 100;
      }
    }

    const totalAmount = baseAmount - discountAmount + (transportCharges || 0);

    const newBooking = await Booking.create({
      bookingType,
      userId,
      salonId,
      freelancerId,
      staffId,
      services,
      comboId,
      schedule,
      baseAmount,
      discountAmount,
      transportCharges,
      totalAmount,
      event,
      status: "pending",
    });

    res.status(201).json({
      message: "Booking request sent to Salon/Freelancer",
      booking: newBooking,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

export const updateBookingStatusByProvider = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // approved / rejected

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking ${status} successfully`, booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status", error: error.message });
  }
};

export const confirmBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentType, transactionId, couponCode } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "approved") {
      return res.status(400).json({ message: "Booking is not approved yet" });
    }

    booking.paymentType = paymentType;
    booking.transactionId = transactionId || null;
    booking.paymentStatus = paymentType === "cash" ? "pending" : "paid";
    booking.status = "confirmed";

    await booking.save();

    res.json({ message: "Booking confirmed with payment", booking });
  } catch (error) {
    res.status(500).json({ message: "Error confirming booking", error: error.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Booking completed successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error completing booking", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};
