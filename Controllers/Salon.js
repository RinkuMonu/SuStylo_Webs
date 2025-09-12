import Salon from "../Models/SalonModel.js";
import Service from "../Models/ServicesModel.js";
import Schedule from "../Models/ScheduleModel.js";

/**
 * 🔹 Create Salon
 */
export const createSalon = async (req, res) => {
  try {
    const { salonName, description, contact, address, facilities, chairCount } = req.body;

    const photos = req.files?.photos?.map((file) => file.path) || [];
    const agreementDocs = req.files?.agreementDocs?.map((file) => file.path) || [];

    const newSalon = new Salon({
      owner: req.user.id,
      salonName,
      description,
      contact,
      address,
      facilities,
      chairCount,
      photos,
      agreementDocs,
    });

    await newSalon.save();

    res.status(201).json({
      success: true,
      message: "Salon created successfully",
      salon: newSalon,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 Get All Salons
 */
export const getAllSalons = async (req, res) => {
  try {
    const salons = await Salon.find().populate("owner", "name email");
    res.status(200).json({ success: true, salons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 Get Salon by ID
 */
export const getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id)
      .populate("owner", "name email")
      .populate("services")
      .populate("schedules");

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    res.status(200).json({ success: true, salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 Update Salon
 */
export const updateSalon = async (req, res) => {
  try {
    const updates = req.body;

    if (req.files?.photos) {
      updates.photos = req.files.photos.map((file) => file.path);
    }
    if (req.files?.agreementDocs) {
      updates.agreementDocs = req.files.agreementDocs.map((file) => file.path);
    }

    const salon = await Salon.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    res.status(200).json({ success: true, message: "Salon updated", salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 Delete Salon
 */
export const deleteSalon = async (req, res) => {
  try {
    const salon = await Salon.findByIdAndDelete(req.params.id);
    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    await Service.deleteMany({ salon: salon._id });
    await Schedule.deleteMany({ salon: salon._id });

    res.status(200).json({ success: true, message: "Salon deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 Add Service to Salon
 */
export const addService = async (req, res) => {
  try {
    const { category, name, description, price, discountPrice, duration, gender } = req.body;

    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    const newService = new Service({
      salon: salon._id,
      category,
      name,
      description,
      price,
      discountPrice,
      duration,
      gender,
    });

    await newService.save();

    res.status(201).json({ success: true, message: "Service added", service: newService });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 Add Schedule to Salon
 */
export const addSchedule = async (req, res) => {
  try {
    const { day, isOpen, openingTime, closingTime, repeatType, slots } = req.body;

    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    const newSchedule = new Schedule({
      salon: salon._id,
      day,
      isOpen,
      openingTime,
      closingTime,
      repeatType,
      slots,
    });

    await newSchedule.save();

    res.status(201).json({ success: true, message: "Schedule added", schedule: newSchedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};