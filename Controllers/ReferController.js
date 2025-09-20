import Referral from "../Models/ReferralModel.js";
import Wallet from "../Models/WalletModel.js";

// 🔹 SuperAdmin: Update Global Reward
export const updateReferralReward = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid reward amount" });
    }

    const setting = await Referral.findOneAndUpdate(
      { isGlobalSetting: true },
      { rewardAmount: amount },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Referral reward updated", reward: setting.rewardAmount });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// 🔹 Create Referral (User A → User B)
export const createReferral = async (req, res) => {
  try {
    const { referredTo } = req.body;   // User B ka id
    const referredBy = req.user._id;   // User A ka id (token se)

    if (!referredTo) {
      return res.status(400).json({ success: false, message: "ReferredTo (User B id) required" });
    }

    if (referredBy.toString() === referredTo.toString()) {
      return res.status(400).json({ success: false, message: "You cannot refer yourself" });
    }

    // ✅ Check if User B is already referred
    const alreadyReferred = await Referral.findOne({ referredTo, isGlobalSetting: false });
    if (alreadyReferred) {
      return res.status(400).json({ success: false, message: "This user is already referred by someone else" });
    }

    // ✅ Global reward fetch
    const globalSetting = await Referral.findOne({ isGlobalSetting: true });
    const rewardAmount = globalSetting ? globalSetting.rewardAmount : 100;

    // ✅ Create referral entry
    const referral = await Referral.create({
      referredBy,
      referredTo,
      rewardAmount,
      status: "partial_rewarded"
    });

    // ✅ Find/create wallet for User A
    let wallet = await Wallet.findOne({ owner: referredBy, ownerModel: "User" });
    if (!wallet) {
      wallet = await Wallet.create({
        owner: referredBy,
        ownerModel: "User",
        balance: 0,
        transactions: [],
      });
    }

    // ✅ Credit 20% now (on User B login)
    const firstReward = rewardAmount * 0.2;
    const transaction = {
      type: "credit",
      amount: firstReward,
      method: "referral",
      relatedUser: referredTo,
      description: `20% referral reward credited (on User B login)`
    };

    wallet.transactions.push(transaction);
    wallet.balance += firstReward;
    await wallet.save();

    referral.walletTransactionId = wallet.transactions[wallet.transactions.length - 1]._id;
    await referral.save();

    res.status(201).json({ success: true, referral, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// 🔹 Complete Referral Reward (triggered on User B first booking complete)
export const completeReferralReward = async (req, res) => {
  try {
    const { bookingId, userBId } = req.body; // booking complete hone ke baad trigger

    if (!userBId) {
      return res.status(400).json({ success: false, message: "UserBId required" });
    }

    const referral = await Referral.findOne({ referredTo: userBId, status: "partial_rewarded" });
    if (!referral) {
      return res.status(404).json({ success: false, message: "No referral found or already completed" });
    }

    const userA = referral.referredBy;
    const remainingReward = referral.rewardAmount * 0.8;

    let wallet = await Wallet.findOne({ owner: userA, ownerModel: "User" });
    if (!wallet) {
      wallet = await Wallet.create({ owner: userA, ownerModel: "User", balance: 0, transactions: [] });
    }

    const transaction = {
      type: "credit",
      amount: remainingReward,
      method: "referral",
      relatedUser: userBId,
      bookingId,
      description: `80% referral reward credited (after User B first booking)`
    };

    wallet.transactions.push(transaction);
    wallet.balance += remainingReward;
    await wallet.save();

    referral.status = "fully_rewarded";
    await referral.save();

    res.json({ success: true, message: "Referral reward completed", referral, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// 🔹 Get Referral History (User A)
export const getReferralHistory = async (req, res) => {
  try {
    const referrals = await Referral.find({ referredBy: req.user._id, isGlobalSetting: false })
      .populate("referredTo", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, referrals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔹 Get All Referrals (Super Admin)
export const getAllReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ isGlobalSetting: false })
      .populate("referredBy", "name email")
      .populate("referredTo", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, referrals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};