import Schedule from "../Models/ScheduleModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";

export const createSchedule = async (req, res) => {
  try {
    const data = req.body;
    // Determine who creates this
    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      // They must pass either salonId or freelancerId in body
    } else if (req.user.role === "Salon") {
      data.salonId = req.user.salonId;
    } else if (req.user.role === "Freelancer") {
      data.freelancerId = req.user.freelancerId;
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const schedule = await Schedule.create(data);
    res.status(201).json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllSchedules = async (req, res) => {
  try {
    if (["SuperAdmin", "Admin"].includes(req.user.role)) {
      const schedules = await Schedule.find().populate("salonId freelancerId staff service");
      return res.json({ success: true, schedules });
    }
    if (req.user.role === "Salon") {
      const schedules = await Schedule.find({ salonId: req.user.salonId }).populate("staff service");
      return res.json({ success: true, schedules });
    }
    if (req.user.role === "Freelancer") {
      const schedules = await Schedule.find({ freelancerId: req.user.freelancerId }).populate("staff service");
      return res.json({ success: true, schedules });
    }
    return res.status(403).json({ success: false, message: "Forbidden" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate("staff service");
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    // Permission check
    if (
      ["SuperAdmin", "Admin"].includes(req.user.role)
      || (req.user.role === "Salon" && String(schedule.salonId) === String(req.user.salonId))
      || (req.user.role === "Freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
    ) {
      return res.json({ success: true, schedule });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    // Permission
    if (
      ["SuperAdmin", "Admin"].includes(req.user.role)
      || (req.user.role === "Salon" && String(schedule.salonId) === String(req.user.salonId))
      || (req.user.role === "Freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
    ) {
      Object.assign(schedule, req.body);
      await schedule.save();
      res.json({ success: true, schedule });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    if (
      ["SuperAdmin", "Admin"].includes(req.user.role)
      || (req.user.role === "Salon" && String(schedule.salonId) === String(req.user.salonId))
      || (req.user.role === "Freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
    ) {
      await schedule.deleteOne();
      res.json({ success: true, message: "Schedule deleted" });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
