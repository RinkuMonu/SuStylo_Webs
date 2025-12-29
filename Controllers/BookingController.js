import Booking from "../Models/BookingModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";
import Wallet from "../Models/WalletModel.js";
import Commission from "../Models/CommissionModel.js";
import Cart from "../Models/CartModel.js";
import mongoose from "mongoose";
import { completeReferralReward } from "./ReferController.js";

// Helper: get commission for salon/freelancer
const getApplicableCommission = async (type, targetId, defaultPercentage) => {
  const commission = await Commission.findOne({ type, targetId, isActive: true });
  if (commission) return commission.flat || (defaultPercentage ? commissionPercentageToAmount(defaultPercentage) : 0);
  return defaultPercentage || 0;
};
export const getBookingsByUser = async (req, res) => {
  try {
    const userId  = req.user._id;  
    const bookings = await Booking.find({ userId }).populate('salonId').populate('freelancerId').populate('services.serviceId').sort({createdAt:-1});
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } 
};


// Booking creation
// export const createBooking = async (req, res) => {
//   console.log("Booking creation request body:", req.body);
//   try {
//     const userId = req.user._id;
//     const {
//       address,
//       bookingType,
//       salonId,
//       freelancerId,
//       userType,
//       services,
//       scheduleId,
//       paymentType,
//       // transportCharges,
//       // staffId,
//       // event,
//       isAtHome,
//     } = req.body;

//     // Calculate base amount
//     const baseAmount = services.reduce((acc, s) => acc + s.price * (s.quantity || 1), 0);
//     const totalAmount = baseAmount;
//     const booking = await Booking.create({
//       address,
//       bookingType,
//       userId,
//       salonId,
//       freelancerId,
//       services,
//       scheduleId,
//       baseAmount,
//       totalAmount,
//       paymentType,
//       isAtHome,
//     });

//     // Clear user's cart after successful booking
//     await Cart.findOneAndDelete({ userId });

//     res.status(201).json({
//       success: true,
//       message: "Booking created successfully and cart cleared",
//       booking,
//     });

//   } catch (err) {
//     console.error("Booking creation error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const createBooking = async (req, res) => {
  console.log("Booking creation request body:", req.body);
  try {
    const userId = req.user._id;
    const {
      address,
      bookingType,
      salonId,
      freelancerId,
      services,
      scheduleId,
      paymentType, // "wallet" | "cash"
      isAtHome,
    } = req.body;

    // ✅ Calculate base & total
    const baseAmount = services.reduce(
      (acc, s) => acc + s.price * (s.quantity || 1),
      0
    );
    const totalAmount = baseAmount;

    let paymentStatus = "pending";

    // ✅ Case 3: Salon service + wallet payment
    if (!isAtHome && paymentType === "wallet") {
      const userWallet = await Wallet.findOne({
        owner: userId,
        ownerModel: "User",
      });

      if (!userWallet) {
        return res
          .status(404)
          .json({ success: false, message: "Wallet not found!" });
      }

      if (userWallet.balance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance!",
        });
      }

      // ✅ Deduct balance
      userWallet.balance -= totalAmount;
      userWallet.transactions.push({
        type: "debit",
        amount: totalAmount,
        method: "online",
        bookingId: null,
        description: "Booking payment via wallet",
      });
      await userWallet.save();

      paymentStatus = "paid";
    }

    // ✅ Create booking
    const booking = await Booking.create({
      address,
      bookingType,
      userId,
      salonId,
      freelancerId,
      services,
      scheduleId,
      baseAmount,
      totalAmount,
      paymentType,
      paymentStatus, // pending or paid
      isAtHome,
      status: "pending",
    });

    // 🔄 Update wallet transaction with bookingId (if wallet used)
    if (!isAtHome && paymentType === "wallet") {
      const userWallet = await Wallet.findOne({
        owner: userId,
        ownerModel: "User",
      });
      const lastTx = userWallet.transactions[userWallet.transactions.length - 1];
      if (lastTx) {
        lastTx.bookingId = booking._id;
        await userWallet.save();
      }
    }

    // 🛒 Clear cart
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error("Booking creation error:", err);
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    const tokenFreelancerId = req.user.freelancerId; // Token से freelancerId

    console.log("=== CANCEL BOOKING DEBUG ===");
    console.log("User ID:", userId);
    console.log("User Role:", userRole);
    console.log("Token Freelancer ID:", tokenFreelancerId);
    console.log("Booking ID:", bookingId);

    // Find booking
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    console.log("Booking User ID:", booking.userId);
    console.log("Booking Salon ID:", booking.salonId);
    console.log("Booking Freelancer ID:", booking.freelancerId);
    console.log("Current Status:", booking.status);

    // Authorization check
    let isAuthorized = false;
    
    if (userRole === 'customer') {
      // Customer can only cancel their own bookings
      if (booking.userId && booking.userId.toString() === userId.toString()) {
        isAuthorized = true;
        console.log("✅ Customer authorized to cancel their own booking");
      }
    } 
    else if (userRole === 'admin') {
      // Salon owner/admin can cancel their salon's bookings
      if (booking.salonId) {
        const salon = await Salon.findOne({ owner: userId }).session(session);
        if (salon && booking.salonId.toString() === salon._id.toString()) {
          isAuthorized = true;
          console.log("✅ Salon owner authorized to cancel salon booking");
        }
      }
    }
    else if (userRole === 'freelancer') {
      // Freelancer can cancel their own bookings
      // OPTION 1: Check against token freelancerId
      if (tokenFreelancerId && booking.freelancerId && 
          booking.freelancerId.toString() === tokenFreelancerId) {
        isAuthorized = true;
        console.log("✅ Freelancer authorized (via token freelancerId)");
      }
      // OPTION 2: Check if user._id matches freelancer.user field
      else {
        const freelancer = await Freelancer.findOne({ 
          user: userId 
        }).session(session);
        
        if (freelancer && booking.freelancerId && 
            booking.freelancerId.toString() === freelancer._id.toString()) {
          isAuthorized = true;
          console.log("✅ Freelancer authorized (via user reference)");
        }
      }
    }
    else if (userRole === 'super_admin') {
      // Super admin can cancel any booking
      isAuthorized = true;
      console.log("✅ Super admin authorized");
    }

    console.log("Final Authorization:", isAuthorized);

    if (!isAuthorized) {
      await session.abortTransaction();
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to cancel this booking",
        debugInfo: {
          userRole,
          tokenFreelancerId,
          bookingFreelancerId: booking.freelancerId,
          bookingSalonId: booking.salonId,
          bookingUserId: booking.userId
        }
      });
    }

    // Check if booking can be cancelled
    const allowedStatuses = ['pending', 'approved', 'pendingApproval', 'confirmed'];
    if (!allowedStatuses.includes(booking.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with current status: ${booking.status}. Only pending, approved, or confirmed bookings can be cancelled.`
      });
    }

    // Update booking status
    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledBy = userId;
    booking.cancelledAt = new Date();

    // REFUND LOGIC - Check if payment was made
    if (booking.paymentStatus === 'paid') {
      console.log("Processing refund for paid booking...");
      
      // Find super admin
      const SuperAdmin = mongoose.model("User") || mongoose.model("Admin");
      const superAdmin = await SuperAdmin.findOne({ 
        role: "super_admin" 
      }).session(session);

      if (superAdmin) {
        const superAdminWallet = await Wallet.findOne({ 
          owner: superAdmin._id, 
          ownerModel: "User" 
        }).session(session);

        if (superAdminWallet) {
          // Deduct from super admin wallet
          superAdminWallet.balance -= booking.totalAmount;
          superAdminWallet.transactions.push({
            type: "debit",
            amount: booking.totalAmount,
            bookingId: booking._id,
            description: `Refund for cancelled booking #${bookingId.slice(-8)}`
          });
          await superAdminWallet.save({ session });
          console.log("✅ Deducted from super admin wallet");

          // Refund to customer wallet if payment was via wallet
          if (booking.paymentType === 'wallet') {
            const userWallet = await Wallet.findOne({
              owner: booking.userId,
              ownerModel: "User"
            }).session(session);

            if (userWallet) {
              userWallet.balance += booking.totalAmount;
              userWallet.transactions.push({
                type: "credit",
                amount: booking.totalAmount,
                bookingId: booking._id,
                description: `Refund for cancelled booking #${bookingId.slice(-8)}`
              });
              await userWallet.save({ session });

              // Add to refund history
              booking.refundHistory.push({
                amount: booking.totalAmount,
                refundedTo: "wallet",
                date: new Date(),
                description: "Refund to customer wallet"
              });
              console.log("✅ Refunded to customer wallet");
            }
          } else if (booking.paymentType === 'cash') {
            // For cash payments, add to refund history
            booking.refundHistory.push({
              amount: booking.totalAmount,
              refundedTo: "cash_refund",
              date: new Date(),
              description: "Cash refund to be processed"
            });
            console.log("✅ Cash refund recorded");
          }
        }
      }

      // Revert commissions if they were already calculated
      if (booking.commissionAmount > 0) {
        console.log("Reverting commissions...");
        const salonWallet = await Wallet.findOne({ 
          owner: booking.salonId, 
          ownerModel: "Salon" 
        }).session(session);
        
        const freelancerWallet = await Wallet.findOne({ 
          owner: booking.freelancerId, 
          ownerModel: "Freelancer" 
        }).session(session);

        const salonComm = booking.salonCommission || 0;
        const freelancerComm = booking.freelancerCommission || 0;

        if (salonWallet && salonComm > 0) {
          salonWallet.balance += salonComm;
          if (booking.paymentType === 'cash') {
            salonWallet.cashPending -= (booking.totalAmount - salonComm);
          }
          salonWallet.transactions.push({
            type: "credit",
            amount: salonComm,
            bookingId: booking._id,
            description: "Commission revert due to cancellation"
          });
          await salonWallet.save({ session });
          console.log("✅ Salon commission reverted");
        }

        if (freelancerWallet && freelancerComm > 0) {
          freelancerWallet.balance += freelancerComm;
          if (booking.paymentType === 'cash') {
            freelancerWallet.cashPending -= (booking.totalAmount - freelancerComm);
          }
          freelancerWallet.transactions.push({
            type: "credit",
            amount: freelancerComm,
            bookingId: booking._id,
            description: "Commission revert due to cancellation"
          });
          await freelancerWallet.save({ session });
          console.log("✅ Freelancer commission reverted");
        }
      }
    } else {
      console.log("No refund needed - payment not completed");
    }

    await booking.save({ session });
    await session.commitTransaction();

    console.log("✅ Booking cancelled successfully");
    
    res.json({ 
      success: true, 
      message: "Booking cancelled successfully",
      booking: {
        _id: booking._id,
        status: booking.status,
        cancellationReason: booking.cancellationReason,
        cancelledAt: booking.cancelledAt,
        refundProcessed: booking.paymentStatus === 'paid'
      }
    });

  } catch (err) {
    await session.abortTransaction();
    console.error("❌ Cancellation error:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid booking ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: err.message,
      errorType: err.name 
    });
  } finally {
    session.endSession();
  }
};


//========================================================================

// In your BookingController.js
export const getAllBookingsForAdmin = async (req, res) => {
  try {
    const { status, salonId, freelancerId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (salonId) filter.salonId = salonId;
    if (freelancerId) filter.freelancerId = freelancerId;

    const bookings = await Booking.find(filter)
      // .populate('userId', 'name email')
      .populate('salonId', 'name')
      .populate('freelancerId', 'name')
      .populate('services.serviceId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getBookingsByProvider = async (req, res) => {
//   try {
//     const user = req.user; // Contains _id and role (e.g., 'freelancer', 'admin' for salon)
//     let filter = {};

//     // If user is a freelancer, show their bookings
//     if (user.role === 'freelancer') {
//       filter.freelancerId = user._id;
//     }
//     // If user is a salon owner/admin, show bookings for their salon
//     else if (user.role === 'admin') {
//       const salon = await Salon.findOne({ owner: user._id });
//       if (salon) filter.salonId = salon._id;
//     } else {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     const bookings = await Booking.find(filter)
//       // .populate('userId', 'name')
//       .populate('services.serviceId', 'name')
//       .sort({ createdAt: -1 });

//     res.json({ success: true, bookings });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getBookingsByProvider = async (req, res) => {
  try {
    const user = req.user;
    let filter = {};

    console.log("=== DEBUG getBookingsByProvider ===");
    console.log("User ID:", user._id);
    console.log("User Role:", user.role);
    console.log("Freelancer ID from token:", user.freelancerId);

    if (user.role === 'freelancer') {
      // ❌ WRONG: filter.freelancerId = user._id; (user._id is User ID, not Freelancer ID)
      
      // ✅ CORRECT: Use freelancerId from token
      if (user.freelancerId) {
        filter.freelancerId = user.freelancerId;
        console.log("Filtering by freelancerId:", user.freelancerId);
      } 
      // OR find freelancer using user._id
      else {
        const freelancer = await Freelancer.findOne({ user: user._id });
        if (freelancer) {
          filter.freelancerId = freelancer._id;
          console.log("Found freelancer via user reference:", freelancer._id);
        } else {
          console.log("No freelancer found for user");
          return res.json({ success: true, bookings: [] });
        }
      }
    }
    else if (user.role === 'admin') {
      const salon = await Salon.findOne({ owner: user._id });
      if (salon) {
        filter.salonId = salon._id;
        console.log("Filtering by salonId:", salon._id);
      } else {
        console.log("No salon found for admin user");
        return res.json({ success: true, bookings: [] });
      }
    } else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    console.log("Final filter:", filter);

    const bookings = await Booking.find(filter)
      .populate('services.serviceId', 'name')
      .populate('salonId', 'name')
      .populate('freelancerId', 'fullName')
      .sort({ createdAt: -1 });

    console.log("Found bookings:", bookings.length);

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Error in getBookingsByProvider:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveBookingByProvider = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;
    const { approvedPrice, status } = req.body;
    const providerId = req.user._id;
    const providerRole = req.user.role;
    const tokenFreelancerId = req.user.freelancerId; // Token से freelancerId

    console.log("=== DEBUG INFO ===");
    console.log("Provider ID from token:", providerId);
    console.log("Freelancer ID from token:", tokenFreelancerId);
    console.log("Provider Role:", providerRole);
    console.log("Booking ID:", bookingId);

    const booking = await Booking.findById(bookingId).session(session);
    
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    console.log("Booking freelancerId:", booking.freelancerId);
    console.log("Booking salonId:", booking.salonId);
    console.log("Current booking status:", booking.status);

    // Authorization check - IMPORTANT FIX HERE
    let isAuthorized = false;
    let isFreelancer = false;
    let isSalonOwner = false;
    
    if (providerRole === 'freelancer') {
      console.log("Checking freelancer authorization...");
      
      // OPTION 1: Check against booking.freelancerId
      if (booking.freelancerId) {
        console.log("Booking freelancerId:", booking.freelancerId.toString());
        console.log("Token freelancerId:", tokenFreelancerId);
        
        if (booking.freelancerId.toString() === tokenFreelancerId) {
          isAuthorized = true;
          isFreelancer = true;
          console.log("✅ Freelancer authorized (via freelancerId match)");
        } else {
          console.log("❌ Freelancer ID mismatch");
        }
      }
      
      // OPTION 2: Also check if user._id matches freelancer.user field
      if (!isAuthorized) {
        const freelancer = await Freelancer.findOne({ 
          user: providerId 
        }).session(session);
        
        if (freelancer && booking.freelancerId && 
            booking.freelancerId.toString() === freelancer._id.toString()) {
          isAuthorized = true;
          isFreelancer = true;
          console.log("✅ Freelancer authorized (via user reference)");
        }
      }
    } 
    else if (providerRole === 'admin') {
      console.log("Checking salon owner authorization...");
      const salon = await Salon.findOne({ owner: providerId }).session(session);
      
      if (salon) {
        console.log("Found salon for owner:", salon._id);
        console.log("Booking salonId:", booking.salonId);
        
        if (booking.salonId && booking.salonId.toString() === salon._id.toString()) {
          isAuthorized = true;
          isSalonOwner = true;
          console.log("✅ Salon owner authorized");
        }
      }
    }

    console.log("Final authorization status:", isAuthorized);
    console.log("=== END DEBUG ===");

    if (!isAuthorized) {
      await session.abortTransaction();
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to approve this booking" 
      });
    }

    // Only allow approval from 'pending' or 'pendingApproval' status
    if (!['pending', 'pendingApproval'].includes(booking.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot approve booking with current status: ${booking.status}`
      });
    }

    // ✅ CRITICAL: CHECK IF SALON OWNER IS TRYING TO INCREASE PRICE
    if (isSalonOwner && approvedPrice && approvedPrice > booking.totalAmount) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Salon owners cannot increase the booking price. Only freelancers can negotiate price increases."
      });
    }

    // ✅ ONLY FREELANCER CAN INCREASE PRICE
    // Salon owner can only approve at same or lower price
    let finalApprovedPrice = approvedPrice;
    if (isSalonOwner && approvedPrice) {
      // Salon owner cannot increase price, can only keep same or reduce
      if (approvedPrice > booking.totalAmount) {
        await session.abortTransaction();
        return res.status(403).json({
          success: false,
          message: "Salon owners cannot increase price. You can only approve at same or lower price."
        });
      }
    }
    
    // Freelancer can increase or decrease price
    if (isFreelancer && approvedPrice) {
      finalApprovedPrice = approvedPrice;
    }

    // UPDATE PRICE AND STATUS
    booking.status = status;
    
    // Only update approvedPrice if provided
    if (approvedPrice) {
      booking.approvedPrice = finalApprovedPrice;
    }
    
    booking.approvedBy = providerId;

    // RECALCULATE COMMISSION based on the new approvedPrice
    if (status === 'approved' && finalApprovedPrice) {
      const salon = await Salon.findById(booking.salonId).session(session);
      const freelancer = await Freelancer.findById(booking.freelancerId).session(session);

      // Use your getApplicableCommission helper
      let salonComm = await getApplicableCommission("salon", booking.salonId, salon?.commission?.percentage);
      let freelancerComm = await getApplicableCommission("freelancer", booking.freelancerId, freelancer?.commission?.percentage);

      salonComm = (finalApprovedPrice * salonComm) / 100;
      freelancerComm = (finalApprovedPrice * freelancerComm) / 100;

      // Update commission fields in the booking
      booking.commissionAmount = salonComm + freelancerComm;
      booking.salonCommission = salonComm;
      booking.freelancerCommission = freelancerComm;
      booking.totalAmount = finalApprovedPrice; // Update the final total
    }

    await booking.save({ session });
    await session.commitTransaction();
    
    res.json({ 
      success: true, 
      message: `Booking ${status}`,
      updatedBy: isFreelancer ? "freelancer" : "salon_owner",
      priceUpdated: approvedPrice ? true : false,
      booking 
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};