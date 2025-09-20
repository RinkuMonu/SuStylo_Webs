import Referral from "../models/Referral.js";
import Wallet from "../models/Wallet.js";
import Setting from "../models/Setting.js";
import Customer from "../models/Customer.js";

/**
 * ✅ Create Referral (Accessible by users)
 */
export const createReferral = async (req, res) => {
  try {
    const { referredTo } = req.body;
    const referredBy = req.user._id; // 🔹 logged-in user se directly

    // Check valid users
    const refBy = await Customer.findById(referredBy);
    const refTo = await Customer.findById(referredTo);
    if (!refBy || !refTo) {
      return res.status(400).json({ message: "Invalid referrer or referee" });
    }

    // Reward amount fetch from settings
    const setting = await Setting.findOne({ key: "referralReward" });
    const rewardAmount = setting ? setting.value : 50; // default 50

    // Referral entry
    const referral = await Referral.create({
      referredBy,
      referredTo,
      rewardAmount,
      status: "rewarded",
    });
    

    // Wallet update
    let wallet = await Wallet.findOne({ owner: referredBy, ownerModel: "User" });
    if (!wallet) {
      wallet = await Wallet.create({
        owner: referredBy,
        ownerModel: "User",
        balance: 0,
        transactions: [],
      });
    }

    // Transaction push
    const transaction = {
      type: "credit",
      amount: rewardAmount,
      method: "referral",
      relatedUser: referredTo,
      description: `Referral reward for referring user ${refTo.name}`,
    };

    wallet.transactions.push(transaction);
    wallet.balance += rewardAmount;
    await wallet.save();

    referral.walletTransactionId = wallet.transactions[wallet.transactions.length - 1]._id;
    await referral.save();

    res.status(201).json({ success: true, referral, wallet });
  } catch (err) {
    console.error("Referral Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Super Admin: Update Referral Reward
 */
export const updateReferralReward = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid reward amount" });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: "referralReward" },
      { value: amount },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Referral reward updated successfully",
      setting,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

export const getReferralHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Query params
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // Find referrals with pagination
    const referrals = await Referral.find({ referredBy: userId })
      .populate("referredTo", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count for pagination
    const totalReferrals = await Referral.countDocuments({ referredBy: userId });

    // Find wallet details
    const wallet = await Wallet.findOne({ owner: userId, ownerModel: "User" });

    res.json({
      success: true,
      referrals,
      wallet,
      pagination: {
        total: totalReferrals,
        page,
        limit,
        totalPages: Math.ceil(totalReferrals / limit),
      },
    });
    
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

export const getAllReferrals = async (req, res) => {
  try {
    let { page = 1, limit = 10, status, fromDate, toDate, search } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // 🔹 Status filter
    if (status) {
      filter.status = status;
    }

    // 🔹 Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    // 🔹 Search by referralCode or referee name/email/phone
    if (search) {
      filter.$or = [
        { referralCode: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }
      ];
    }

    // Fetch referrals with pagination
    const referrals = await Referral.find(filter)
      .populate("referredBy", "name email phone")
      .populate("referredTo", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Referral.countDocuments(filter);

    res.json({
      success: true,
      referrals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};