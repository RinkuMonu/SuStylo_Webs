import Service from "../Models/ServicesModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";

// Global search API
export const globalSearch = async (req, res) => {
  try {
    const { query } = req.query; // ?query=haircut

    if (!query) {
      return res.status(400).json({ success: false, message: "Query parameter is required" });
    }

    const regex = new RegExp(query, "i"); // case-insensitive search

    // 🔹 Search Services
    const services = await Service.find({ name: regex, isActive: true })
      .populate("salonId", "salonName")
      .populate("freelancerId", "fullName");

    // 🔹 Search Salons
    const salons = await Salon.find({ salonName: regex, isActive: true })
      .populate("services");

    // 🔹 Search Freelancers
    const freelancers = await Freelancer.find({ fullName: regex, isActive: true })
      .populate("services");

    res.json({
      success: true,
      results: {
        services,
        salons,
        freelancers
      },
    });
  } catch (err) {
    console.error("GlobalSearch Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
