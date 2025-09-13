import Salon from "../Models/SalonModel.js";
import Service from "../Models/ServicesModel.js";
import Schedule from "../Models/ScheduleModel.js";

export const createSalon = async (req, res) => {
  try {
    const salon = await Salon.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllSalons = async (req, res) => {
  try {
    const salons = await Salon.find().populate("staff services referrals");
    res.json({ success: true, salons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id).populate("staff services referrals");
    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });
    res.json({ success: true, salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSalon = async (req, res) =>  {
  try {
    let salon;

    // If Super Admin or Admin: can update any salon
    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      salon = await Salon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      // Salon role: only own salon
      salon = await Salon.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        req.body,
        { new: true }
      );
    }

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found or unauthorized" });

    res.json({ success: true, salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSalon = async (req, res) => {
  try {
    let salon;

    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      salon = await Salon.findByIdAndDelete(req.params.id);
    } else {
      salon = await Salon.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    }

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found or unauthorized" });

    res.json({ success: true, message: "Salon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleSalonStatus = async (req, res) => {
  try {
    let salon;

    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      salon = await Salon.findById(req.params.id);
    } else {
      salon = await Salon.findOne({ _id: req.params.id, owner: req.user._id });
    }

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found or unauthorized" });

    salon.isActive = !salon.isActive;
    await salon.save();

    res.json({ success: true, isActive: salon.isActive, message: `Salon is now ${salon.isActive ? "active" : "inactive"}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

