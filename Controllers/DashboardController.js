import Booking from "../Models/BookingModel.js";
import Customer from "../Models/CustomerModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";
import Lead from "../Models/LeadModel.js";
import Coupon from "../Models/CouponModel.js";
import Ticket from "../Models/TicketRaiseModel.js";
import Referral from "../Models/ReferralModel.js";
import Staff from "../Models/StaffModel.js";
import Attendance from "../Models/AttendanceModel.js";
import Wallet from "../Models/WalletModel.js";
import mongoose from "mongoose";

// Helper to get Date Range for Today
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const getSuperAdminDashboard = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const todayQuery = { createdAt: { $gte: start, $lte: end } };

    const [
      totalCustomers, totalSalons, totalFreelancers,
      totalCoupons, totalLeads, todayLeads, totalTickets,
      todayReferrals, overallReferrals,
      earningsData, todayEarningsData,
      bookingStats, todayBookingStats
    ] = await Promise.all([
      Customer.countDocuments(),
      Salon.countDocuments(),
      Freelancer.countDocuments(),
      Coupon.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments(todayQuery),
      Ticket.countDocuments(),
      Referral.countDocuments(todayQuery),
      Referral.countDocuments(),
      // Earnings & Commission
      Booking.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, commission: { $sum: "$commissionAmount" } } }
      ]),
      Booking.aggregate([
        { $match: { status: "completed", ...todayQuery } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      // Booking Counts
      Booking.aggregate([
        { $group: { _id: "$isAtHome", count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: todayQuery },
        { $group: { _id: "$isAtHome", count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: { totalCustomers, totalSalons, totalFreelancers, totalCoupons, totalLeads, todayLeads, totalTickets },
        referrals: { today: todayReferrals, overall: overallReferrals },
        earnings: {
          overall: earningsData[0]?.total || 0,
          overallCommission: earningsData[0]?.commission || 0,
          today: todayEarningsData[0]?.total || 0
        },
        bookings: {
          overall: {
            total: (bookingStats[0]?.count || 0) + (bookingStats[1]?.count || 0),
            atHome: bookingStats.find(b => b._id === true)?.count || 0,
            atSalon: bookingStats.find(b => b._id === false)?.count || 0,
          },
          today: {
            atHome: todayBookingStats.find(b => b._id === true)?.count || 0,
            atSalon: todayBookingStats.find(b => b._id === false)?.count || 0,
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const todayQuery = { createdAt: { $gte: start, $lte: end } };
    
    // Find Salon ID associated with this Admin/User
    const salon = await Salon.findOne({ owner: req.user._id });
    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    const sId = salon._id;

    const [
      bookings, todayBookings,
      earnings, todayEarnings,
      staffCount, presentStaff,
      tickets, coupons,
      uniqueCustomers, wallet
    ] = await Promise.all([
      Booking.countDocuments({ salonId: sId }),
      Booking.find({ salonId: sId, ...todayQuery }),
      Booking.aggregate([{ $match: { salonId: sId, status: "completed" } }, { $group: { _id: null, sum: { $sum: "$totalAmount" } } }]),
      Booking.aggregate([{ $match: { salonId: sId, status: "completed", ...todayQuery } }, { $group: { _id: null, sum: { $sum: "$totalAmount" } } }]),
      Staff.countDocuments({ salonId: sId }),
      Attendance.countDocuments({ salonId: sId, date: { $gte: start, $lte: end }, status: "present" }),
      Ticket.countDocuments({ salonId: sId }),
      Coupon.aggregate([{ $match: { createdBy: req.user._id } }, { $group: { _id: null, total: { $sum: 1 }, used: { $sum: "$usedCount" } } }]),
      Booking.distinct("userId", { salonId: sId }),
      Wallet.findOne({ owner: sId, ownerModel: "Salon" })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings: bookings,
        todayBookings: {
          total: todayBookings.length,
          atHome: todayBookings.filter(b => b.isAtHome).length,
          atSalon: todayBookings.filter(b => !b.isAtHome).length
        },
        earnings: { total: earnings[0]?.sum || 0, today: todayEarnings[0]?.sum || 0 },
        staff: { total: staffCount, present: presentStaff },
        tickets: tickets,
        coupons: { total: coupons[0]?.total || 0, used: coupons[0]?.used || 0 },
        totalCustomers: uniqueCustomers.length,
        avgRating: salon.rating.average,
        walletBalance: wallet?.balance || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFreelancerDashboard = async (req, res) => {
  try {    
    const { start, end } = getTodayRange();
    const todayQuery = { createdAt: { $gte: start, $lte: end } };

    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer profile not found" });

    const fId = freelancer._id;

    const [
      bookings, todayBookings,
      earnings, todayEarnings,
      tickets, coupons,
      uniqueCustomers, wallet
    ] = await Promise.all([
      Booking.countDocuments({ freelancerId: fId }),
      Booking.countDocuments({ freelancerId: fId, ...todayQuery }),
      Booking.aggregate([{ $match: { freelancerId: fId, status: "completed" } }, { $group: { _id: null, sum: { $sum: "$totalAmount" } } }]),
      Booking.aggregate([{ $match: { freelancerId: fId, status: "completed", ...todayQuery } }, { $group: { _id: null, sum: { $sum: "$totalAmount" } } }]),
      Ticket.countDocuments({ freelancerId: fId }),
      Coupon.aggregate([{ $match: { createdBy: req.user._id } }, { $group: { _id: null, total: { $sum: 1 }, used: { $sum: "$usedCount" } } }]),
      Booking.distinct("userId", { freelancerId: fId }),
      Wallet.findOne({ owner: fId, ownerModel: "Freelancer" })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings: bookings,
        todayBookings: todayBookings,
        earnings: { total: earnings[0]?.sum || 0, today: todayEarnings[0]?.sum || 0 },
        totalTickets: tickets,
        coupons: { total: coupons[0]?.total || 0, used: coupons[0]?.used || 0 },
        totalCustomers: uniqueCustomers.length,
        avgRating: freelancer.rating.average,
        walletBalance: wallet?.balance || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};