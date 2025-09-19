import Service from "../Models/ServicesModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";


export const createService = async (req, res) => {
  try {
    let serviceData = {
      ...req.body,
      image: req.file?.path, // Cloudinary URL
    };

    // Role based ownership
    if (req.user.role === "Salon") {
      serviceData.salonId = req.user.salonId || req.body.salonId;
    } else if (req.user.role === "Freelancer") {
      serviceData.freelancerId = req.user.freelancerId || req.body.freelancerId;
    }

    const service = await Service.create(serviceData);
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAllServices = async (req, res) => {
  try {
    let services;
    if (req.user?.role) {
      // Role-based access
      if (["SuperAdmin", "Admin"].includes(req.user.role)) {
        services = await Service.find().populate("staff categoryId");
      } else if (req.user.role === "Salon") {
        services = await Service.find({ salonId: req.user.salonId }).populate("staff categoryId");
      } else if (req.user.role === "Freelancer") {
        services = await Service.find({ freelancerId: req.user.freelancerId }).populate("staff categoryId");
      } else {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    } else {
      // Public: return all active services
      services = await Service.find({ isActive: true }).populate("staff categoryId");
    }

    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("staff categoryId");
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    if (!req.user?.role) {
      // Public: केवल active service दिखाएँ
      if (!service.isActive) {
        return res.status(403).json({ success: false, message: "Service not available" });
      }
      return res.json({ success: true, service });
    }

    // Logged in user: role-based access
    if (
      ["SuperAdmin", "Admin"].includes(req.user.role) ||
      (req.user.role === "Salon" && String(service.salonId) === String(req.user.salonId)) ||
      (req.user.role === "Freelancer" && String(service.freelancerId) === String(req.user.freelancerId))
    ) {
      return res.json({ success: true, service });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const updateService = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = req.file.path;

    let service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    res.json({ success: true, service });
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
