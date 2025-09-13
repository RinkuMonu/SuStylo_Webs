import Freelancer from "../Models/FreelancerModel.js";

export const createFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, freelancer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find().populate("services employees referrals");
    res.json({ success: true, freelancers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFreelancerById = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate("services employees referrals");
    if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found" });
    res.json({ success: true, freelancer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateFreelancer = async (req, res) => {
  try {
    let freelancer;

    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      freelancer = await Freelancer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      // Freelancer role: only own record
      freelancer = await Freelancer.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    }

    if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found or unauthorized" });

    res.json({ success: true, freelancer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteFreelancer = async (req, res) => {
  try {
    let freelancer;

    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      freelancer = await Freelancer.findByIdAndDelete(req.params.id);
    } else {
      freelancer = await Freelancer.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    }

    if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found or unauthorized" });

    res.json({ success: true, message: "Freelancer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleFreelancerStatus = async (req, res) => {
  try {
    let freelancer;

    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      freelancer = await Freelancer.findById(req.params.id);
    } else {
      freelancer = await Freelancer.findOne({ _id: req.params.id, user: req.user._id });
    }

    if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found or unauthorized" });

    freelancer.isActive = !freelancer.isActive;
    await freelancer.save();

    res.json({ success: true, isActive: freelancer.isActive, message: `Freelancer is now ${freelancer.isActive ? "active" : "inactive"}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
