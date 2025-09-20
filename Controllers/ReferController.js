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

    // ✅ Check if User B is already referred by ANY user
    const alreadyReferred = await Referral.findOne({
      referredTo,
      isGlobalSetting: false
    });
    if (alreadyReferred) {
      return res.status(400).json({
        success: false,
        message: "This user is already referred by someone else"
      });
    }

    // ✅ Check duplicate referral (same A → same B)
    const existingReferral = await Referral.findOne({
      referredBy,
      referredTo,
      isGlobalSetting: false
    });
    if (existingReferral) {
      return res.status(400).json({
        success: false,
        message: "You already referred this user"
      });
    }

    // Global reward fetch
    const globalSetting = await Referral.findOne({ isGlobalSetting: true });
    const rewardAmount = globalSetting ? globalSetting.rewardAmount : 100;

    // Referral entry banate hi referralCode auto-generate ho jayega
    const referral = await Referral.create({
      referredBy,
      referredTo,
      rewardAmount,
      status: "rewarded"
    });
    

    // Find or create wallet for User A
    let wallet = await Wallet.findOne({ owner: referredBy, ownerModel: "User" });
    if (!wallet) {
      wallet = await Wallet.create({
        owner: referredBy,
        ownerModel: "User",
        balance: 0,
        transactions: [],
      });
    }

    // Wallet transaction
    const transaction = {
      type: "credit",
      amount: rewardAmount,
      method: "referral",
      relatedUser: referredTo,
      description: `Referral reward for referring user`,
    };

    wallet.transactions.push(transaction);
    wallet.balance += rewardAmount;
    await wallet.save();

    referral.walletTransactionId = wallet.transactions[wallet.transactions.length - 1]._id;
    await referral.save();

    res.status(201).json({ success: true, referral, wallet });
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
