import Booking from "../models/Booking.js";
import Wallet from "../models/Wallet.js";


export const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("salon")
      .populate("freelancer");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Booking already completed" });
    }

    // 🔹 Role-based check
    if (req.user.role === "freelancer") {
      if (!booking.freelancer || booking.freelancer._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not authorized to complete this booking" });
      }
    }

    if (req.user.role === "salonOwner") {
      if (!booking.salon || booking.salon._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not authorized to complete this booking" });
      }
    }

    booking.status = "completed";
    booking.updatedAt = Date.now();
    await booking.save();

    // 🔹 Cash Payment → settle from salon/freelancer wallet
    if (booking.paymentType === "cash") {
      const targetOwner = booking.salon || booking.freelancer;
      if (targetOwner) {
        let wallet = await Wallet.findOne({ ownerId: targetOwner._id });
        if (!wallet) {
          wallet = new Wallet({ ownerId: targetOwner._id, balance: 0, transactions: [] });
        }

        wallet.balance -= booking.totalAmount;
        wallet.transactions.push({
          type: "debit",
          amount: booking.totalAmount,
          description: `Cash booking settlement for Booking #${booking._id}`,
        });

        await wallet.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking marked as completed successfully",
      booking,
    });
  } catch (err) {
    console.error("Complete booking error:", err);
    res.status(500).json({ success: false, message: "Error completing booking", error: err.message });
  }
};


export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId).populate("user");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Completed booking cannot be cancelled" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking already cancelled" });
    }

    // Only customer or admin can cancel
    if (req.user.role === "customer" && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason || "Cancelled by user";
    booking.updatedAt = Date.now();

    let refundAmount = 0;

    if (booking.paymentType !== "cash" && booking.paymentStatus === "paid") {
      // Refund to customer wallet
      refundAmount = booking.totalAmount;

      let userWallet = await Wallet.findOne({ ownerId: booking.user._id });
      if (!userWallet) {
        userWallet = new Wallet({ ownerId: booking.user._id, balance: 0, transactions: [] });
      }

      userWallet.balance += refundAmount;
      userWallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        description: `Refund for cancelled booking #${booking._id}`,
      });

      await userWallet.save();
    } else if (booking.paymentType === "cash") {
      // Cash case → salon/freelancer wallet deduct karega
      const targetOwner = booking.salon || booking.freelancer;
      if (targetOwner) {
        let wallet = await Wallet.findOne({ ownerId: targetOwner._id });
        if (!wallet) {
          wallet = new Wallet({ ownerId: targetOwner._id, balance: 0, transactions: [] });
        }

        wallet.balance -= booking.totalAmount;
        wallet.transactions.push({
          type: "debit",
          amount: booking.totalAmount,
          description: `Cash booking cancelled for Booking #${booking._id}`,
        });

        await wallet.save();
      }
    }

    booking.refundAmount = refundAmount;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      refundAmount,
      booking,
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ success: false, message: "Error cancelling booking", error: err.message });
  }
};
