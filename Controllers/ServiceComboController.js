import ServiceCombo from "../Models/ComboModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";
import Service from "../Models/ServicesModel.js";

// 🔹 Helper: calculate total and discount
const calculateComboPricing = async (services, basePrice) => {
  let total = 0;
  for (const s of services) {
    const serviceData = await Service.findById(s.service);
    if (!serviceData) throw new Error("Invalid service ID: " + s.service);
    total += (serviceData.price || 0) * (s.quantity || 1);
  }

  let discountPercentage = 0;
  if (total > 0 && basePrice < total) {
    discountPercentage = Math.round(((total - basePrice) / total) * 100);
  }

  return { total, discountPercentage };
};

// 🔹 Create Service Combo
export const createServiceCombo = async (req, res) => {
  try {
    const { title, description, services, basePrice, salonId, freelancerId } = req.body;

    if (!title || !services || !basePrice) {
      return res.status(400).json({ success: false, message: "Required fields missing!" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Combo photo is required!" });
    }

    let servicesData = typeof services === "string" ? JSON.parse(services) : services;

    // calculate pricing
    const { total, discountPercentage } = await calculateComboPricing(servicesData, basePrice);

    const comboData = {
      title,
      description,
      photo: req.file.path,
      services: servicesData,
      totalPrice: total,
      basePrice,
      discountPercentage,
      createdBy: req.user._id,
    };

    if (req.user.role === "super_admin") {
      if (!salonId && !freelancerId) {
        return res.status(400).json({ success: false, message: "Super admin must provide salonId or freelancerId" });
      }
      if (salonId) comboData.salon = salonId;
      if (freelancerId) comboData.freelancer = freelancerId;
    } else if (req.user.role === "admin") {
      const salon = await Salon.findOne({ owner: req.user._id });
      if (!salon) return res.status(404).json({ success: false, message: "Salon not found!" });
      comboData.salon = salon._id;
    } else if (req.user.role === "freelancer") {
      const freelancer = await Freelancer.findOne({ user: req.user._id });
      if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found!" });
      comboData.freelancer = freelancer._id;
    }

    const newCombo = await ServiceCombo.create(comboData);
    res.status(201).json({ success: true, combo: newCombo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Update Service Combo
export const updateServiceCombo = async (req, res) => {
  try {
    const { comboId } = req.params;
    const { title, description, services, basePrice, salonId, freelancerId } = req.body;

    const combo = await ServiceCombo.findById(comboId);
    if (!combo) return res.status(404).json({ success: false, message: "Service combo not found!" });

    // Authorization
    if (req.user.role === "admin") {
      const salon = await Salon.findOne({ owner: req.user._id });
      if (!salon || String(combo.salon) !== String(salon._id)) {
        return res.status(403).json({ success: false, message: "Unauthorized to update this combo!" });
      }
    } else if (req.user.role === "freelancer") {
      const freelancer = await Freelancer.findOne({ user: req.user._id });
      if (!freelancer || String(combo.freelancer) !== String(freelancer._id)) {
        return res.status(403).json({ success: false, message: "Unauthorized to update this combo!" });
      }
    }

    if (title) combo.title = title;
    if (description) combo.description = description;
    if (services) {
      let servicesData = typeof services === "string" ? JSON.parse(services) : services;
      combo.services = servicesData;

      const { total, discountPercentage } = await calculateComboPricing(servicesData, basePrice || combo.basePrice);
      combo.totalPrice = total;
      combo.discountPercentage = discountPercentage;
    }
    if (basePrice) combo.basePrice = basePrice;

    if (req.file) combo.photo = req.file.path;

    await combo.save();
    res.status(200).json({ success: true, combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get all combos
export const getAllServiceCombos = async (req, res) => {
  try {
    const filter = {};
    if (req.query.salonId) filter.salon = req.query.salonId;
    if (req.query.freelancerId) filter.freelancer = req.query.freelancerId;

    const combos = await ServiceCombo.find(filter)
      .populate("services.service")
      .populate("salon")
      .populate("freelancer")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, combos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get combo by ID
export const getServiceComboById = async (req, res) => {
  try {
    const { comboId } = req.params;
    const combo = await ServiceCombo.findById(comboId)
      .populate("services.service")
      .populate("salon")
      .populate("freelancer");

    if (!combo) return res.status(404).json({ success: false, message: "Service combo not found!" });

    res.status(200).json({ success: true, combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete combo
export const deleteServiceCombo = async (req, res) => {
  try {
    const { comboId } = req.params;
    const combo = await ServiceCombo.findById(comboId);
    if (!combo) return res.status(404).json({ success: false, message: "Service combo not found!" });

    if (req.user.role === "admin") {
      const salon = await Salon.findOne({ owner: req.user._id });
      if (!salon || String(combo.salon) !== String(salon._id)) {
        return res.status(403).json({ success: false, message: "Unauthorized to delete this combo!" });
      }
    } else if (req.user.role === "freelancer") {
      const freelancer = await Freelancer.findOne({ user: req.user._id });
      if (!freelancer || String(combo.freelancer) !== String(freelancer._id)) {
        return res.status(403).json({ success: false, message: "Unauthorized to delete this combo!" });
      }
    }

    await combo.deleteOne();
    res.status(200).json({ success: true, message: "Service combo deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
