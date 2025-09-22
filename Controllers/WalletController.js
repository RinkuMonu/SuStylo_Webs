import Wallet from "../Models/WalletModel";

// Get wallet balance
export const getWallet = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const wallet = await Wallet.findOne({ owner: ownerId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add money manually to wallet (Admin)
export const addWalletBalance = async (req, res) => {
  try {
    const { ownerId, ownerModel, amount, description } = req.body;

    let wallet = await Wallet.findOne({ owner: ownerId, ownerModel });
    if (!wallet) {
      wallet = await Wallet.create({ owner: ownerId, ownerModel, balance: amount });
    } else {
      wallet.balance += amount;
    }

    wallet.transactions.push({ type: "credit", amount, method: "manual", description });
    await wallet.save();

    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Debit wallet (Admin)
export const debitWalletBalance = async (req, res) => {
  try {
    const { ownerId, ownerModel, amount, description } = req.body;

    const wallet = await Wallet.findOne({ owner: ownerId, ownerModel });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    wallet.balance -= amount;
    wallet.transactions.push({ type: "debit", amount, method: "manual", description });
    await wallet.save();

    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};