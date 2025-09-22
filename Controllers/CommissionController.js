import Commission from "../Models/CommissionModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";

// Create Commission (global or per salon/freelancer)
export const createCommission = async (req, res) => {
  try {
    const { type, targetId, percentage, flat } = req.body;

    if (!["salon", "freelancer"].includes(type)) {
      return res.status(400).json({ message: "Type must be salon or freelancer" });
    }

    // Optional: validate targetId exists
    if (targetId) {
      if (type === "salon") {
        const salon = await Salon.findById(targetId);
        if (!salon) return res.status(404).json({ message: "Salon not found" });
      } else if (type === "freelancer") {
        const freelancer = await Freelancer.findById(targetId);
        if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });
      }
    }

    const commission = await Commission.create({
      type,
      targetId: targetId || null,
      percentage: percentage || 0,
      flat: flat || 0,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, commission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Commission
export const updateCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { percentage, flat, isActive } = req.body;

    const commission = await Commission.findByIdAndUpdate(id, {
      percentage,
      flat,
      isActive,
      updatedBy: req.user._id
    }, { new: true });

    if (!commission) return res.status(404).json({ message: "Commission not found" });

    res.json({ success: true, commission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all commissions
export const getCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find().populate("targetId");
    res.json({ success: true, commissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Commission
export const deleteCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const commission = await Commission.findByIdAndDelete(id);
    if (!commission) return res.status(404).json({ message: "Commission not found" });
    res.json({ success: true, message: "Commission deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};