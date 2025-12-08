import Booking from "../Models/BookingModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";
import Wallet from "../Models/WalletModel.js";
import Commission from "../Models/CommissionModel.js";
import mongoose from "mongoose";
import { completeReferralReward } from "./ReferController.js";

// Helper: get commission for salon/freelancer
const getApplicableCommission = async (type, targetId, defaultPercentage) => {
  const commission = await Commission.findOne({ type, targetId, isActive: true });
  if (commission) return commission.flat || (defaultPercentage ? commissionPercentageToAmount(defaultPercentage) : 0);
  return defaultPercentage || 0;
};

// Booking creation
export const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingType, salonId, freelancerId, services, comboId, schedule, paymentType, transportCharges, staffId, event, isAtHome } = req.body;

    let baseAmount = services.reduce((acc, s) => acc + s.price * (s.quantity || 1), 0);
    if (comboId) {
      const combo = await mongoose.model("ServiceCombo").findById(comboId);
      if (combo) baseAmount += combo.basePrice;
    }
    const totalAmount = baseAmount + (transportCharges || 0);

    // Set initial status
    const status = isAtHome ? "pendingApproval" : "confirmed";

    const booking = await Booking.create({
      bookingType,
      userId,
      salonId,
      freelancerId,
      staffId,
      services,
      comboId,
      scheduleId: scheduleId, // ✅ map correctly
      baseAmount,
      totalAmount,
      paymentType,
      status,
      event
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve Booking (for at-home)
export const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { updatedPrice, estimatedTime } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.totalAmount = updatedPrice || booking.totalAmount;
    booking.schedule.duration = estimatedTime || booking.schedule.duration;
    booking.status = "approved";
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Confirm Payment and Deduct Commission
export const confirmBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();

    // Get wallets
    const salonWallet = await Wallet.findOne({ owner: booking.salonId, ownerModel: "Salon" });
    const freelancerWallet = await Wallet.findOne({ owner: booking.freelancerId, ownerModel: "Freelancer" });
    const superAdminWallet = await Wallet.findOne({ owner: "super_admin_id", ownerModel: "User" });

    const salon = await Salon.findById(booking.salonId);
    const freelancer = await Freelancer.findById(booking.freelancerId);

    // Calculate commissions
    let salonComm = await getApplicableCommission("salon", booking.salonId, salon.commission?.percentage);
    let freelancerComm = await getApplicableCommission("freelancer", booking.freelancerId, freelancer.commission?.percentage);

    salonComm = (booking.totalAmount * salonComm) / 100;
    freelancerComm = (booking.totalAmount * freelancerComm) / 100;

    // Deduct from salon/freelancer wallet if cash
    if (booking.paymentType === "cash") {
      salonWallet.balance -= salonComm;
      salonWallet.cashPending += booking.totalAmount - salonComm;
      salonWallet.transactions.push({ type: "debit", amount: salonComm, method: "cash", bookingId: booking._id, description: "Cash commission" });
      await salonWallet.save();

      freelancerWallet.balance -= freelancerComm;
      freelancerWallet.cashPending += booking.totalAmount - freelancerComm;
      freelancerWallet.transactions.push({ type: "debit", amount: freelancerComm, method: "cash", bookingId: booking._id, description: "Cash commission" });
      await freelancerWallet.save();
    }

    // Add commissions to super admin wallet
    superAdminWallet.balance += salonComm + freelancerComm;
    superAdminWallet.transactions.push({ type: "credit", amount: salonComm + freelancerComm, bookingId: booking._id, method: booking.paymentType, description: "Booking commission" });
    await superAdminWallet.save();

    res.json({ success: true, booking, salonComm, freelancerComm });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel Booking and Refund
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    await booking.save();

    const superAdminWallet = await Wallet.findOne({ owner: "super_admin_id", ownerModel: "User" });
    superAdminWallet.balance -= booking.totalAmount;
    superAdminWallet.transactions.push({ type: "debit", amount: booking.totalAmount, bookingId: booking._id, description: "Refund cancelled booking" });
    await superAdminWallet.save();

    // Revert commissions
    const salonWallet = await Wallet.findOne({ owner: booking.salonId, ownerModel: "Salon" });
    const freelancerWallet = await Wallet.findOne({ owner: booking.freelancerId, ownerModel: "Freelancer" });

    let salonComm = (booking.totalAmount * (salonWallet.commissionPercentage || 10)) / 100;
    let freelancerComm = (booking.totalAmount * (freelancerWallet.commissionPercentage || 5)) / 100;

    salonWallet.balance += salonComm;
    salonWallet.cashPending -= booking.totalAmount - salonComm;
    salonWallet.transactions.push({ type: "credit", amount: salonComm, method: "cash", bookingId: booking._id, description: "Commission revert due to cancellation" });
    await salonWallet.save();

    freelancerWallet.balance += freelancerComm;
    freelancerWallet.cashPending -= booking.totalAmount - freelancerComm;
    freelancerWallet.transactions.push({ type: "credit", amount: freelancerComm, method: "cash", bookingId: booking._id, description: "Commission revert due to cancellation" });
    await freelancerWallet.save();

    res.json({ success: true, message: "Booking cancelled and refunded", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};