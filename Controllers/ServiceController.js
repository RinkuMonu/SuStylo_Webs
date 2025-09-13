import Service from "../Models/ServicesModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";

export const createService = async (req, res) => {
  try {
    let serviceData = req.body;

    // Role based ownership
    if (req.user.role === "Salon") {
      serviceData.salonId = req.user.salonId || req.body.salonId; // depending how you store
    } else if (req.user.role === "Freelancer") {
      serviceData.freelancerId = req.user.freelancerId || req.body.freelancerId;
    } else if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      // optionally allow specifying salonId/freelancerId in body
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const service = await Service.create(serviceData);
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    // SuperAdmin/Admin see all
    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      const services = await Service.find().populate("staff categoryId");
      return res.json({ success: true, services });
    }

    // For Salon: show only its services
    if (req.user.role === "Salon") {
      const services = await Service.find({ salonId: req.user.salonId }).populate("staff categoryId");
      return res.json({ success: true, services });
    }

    // For Freelancer
    if (req.user.role === "Freelancer") {
      const services = await Service.find({ freelancerId: req.user.freelancerId }).populate("staff categoryId");
      return res.json({ success: true, services });
    }

    return res.status(403).json({ success: false, message: "Forbidden" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("staff categoryId");
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    // Check ownership or admin
    if (
      ["SuperAdmin", "Admin"].includes(req.user.role)
      || (req.user.role === "Salon" && String(service.salonId) === String(req.user.salonId))
      || (req.user.role === "Freelancer" && String(service.freelancerId) === String(req.user.freelancerId))
    ) {
      res.json({ success: true, service });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    // Check permission
    if (
      ["SuperAdmin", "Admin"].includes(req.user.role)
      || (req.user.role === "Salon" && String(service.salonId) === String(req.user.salonId))
      || (req.user.role === "Freelancer" && String(service.freelancerId) === String(req.user.freelancerId))
    ) {
      Object.assign(service, req.body);
      await service.save();
      res.json({ success: true, service });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    // Check permission
    if (
      ["SuperAdmin", "Admin"].includes(req.user.role)
      || (req.user.role === "Salon" && String(service.salonId) === String(req.user.salonId))
      || (req.user.role === "Freelancer" && String(service.freelancerId) === String(req.user.freelancerId))
    ) {
      await service.deleteOne();
      res.json({ success: true, message: "Service deleted" });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
