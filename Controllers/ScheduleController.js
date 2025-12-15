// import Schedule from "../Models/ScheduleModel.js";
// import Salon from "../Models/SalonModel.js";
// import Freelancer from "../Models/FreelancerModel.js";

// export const createSchedule = async (req, res) => {
//   try {
//     const data = req.body;
//     // Determine who creates this
//     if (["super_admin", "admin"].includes(req.user.role)) {
//       // They must pass either salonId or freelancerId in body
//     } else if (req.user.role === "Salon") {
//       data.salonId = req.user.salonId;
//     } else if (req.user.role === "freelancer") {
//       data.freelancerId = req.user.freelancerId;
//     } else {
//       return res.status(403).json({ success: false, message: "Forbidden" });
//     }

//     const schedule = await Schedule.create(data);
//     res.status(201).json({ success: true, schedule });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getAllSchedules = async (req, res) => {
//   try {
//     if (["super_admin", "admin"].includes(req.user.role)) {
//       const schedules = await Schedule.find().populate("salonId freelancerId staff service");
//       return res.json({ success: true, schedules });
//     }
//     if (req.user.role === "Salon") {
//       const schedules = await Schedule.find({ salonId: req.user.salonId }).populate("staff service");
//       return res.json({ success: true, schedules });
//     }
//     if (req.user.role === "freelancer") {
//       const schedules = await Schedule.find({ freelancerId: req.user.freelancerId }).populate("staff service");
//       return res.json({ success: true, schedules });
//     }
//     return res.status(403).json({ success: false, message: "Forbidden" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getScheduleById = async (req, res) => {
//   try {
//     const schedule = await Schedule.findById(req.params.id).populate("staff service");
//     if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

//     // Permission check
//     if (
//       ["super_admin", "admin"].includes(req.user.role)
//       || (req.user.role === "Salon" && String(schedule.salonId) === String(req.user.salonId))
//       || (req.user.role === "freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
//     ) {
//       return res.json({ success: true, schedule });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const updateSchedule = async (req, res) => {
//   try {
//     let schedule = await Schedule.findById(req.params.id);
//     if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

//     // Permission
//     if (
//       ["super_admin", "admin"].includes(req.user.role)
//       || (req.user.role === "Salon" && String(schedule.salonId) === String(req.user.salonId))
//       || (req.user.role === "freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
//     ) {
//       Object.assign(schedule, req.body);
//       await schedule.save();
//       res.json({ success: true, schedule });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const deleteSchedule = async (req, res) => {
//   try {
//     let schedule = await Schedule.findById(req.params.id);
//     if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

//     if (
//       ["super_admin", "admin"].includes(req.user.role)
//       || (req.user.role === "Salon" && String(schedule.salonId) === String(req.user.salonId))
//       || (req.user.role === "freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
//     ) {
//       await schedule.deleteOne();
//       res.json({ success: true, message: "Schedule deleted" });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// }



import Schedule from "../Models/ScheduleModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";

// export const createSchedule = async (req, res) => {
//   try {
//     const data = req.body;

//     // 🔹 Role check
//     if (["super_admin"].includes(req.user.role)) {
//       // super_admin must pass salonId or freelancerId
//     } else if (req.user.role === "admin") {
//       console.log(req.user);
//       // admin = salon owner
//       data.salonId = req.user.salonId;
//     } else if (req.user.role === "freelancer") {
//       data.freelancerId = req.user.freelancerId;
//     } else {
//       return res.status(403).json({ success: false, message: "Forbidden" });
//     }

//     const schedule = await Schedule.create(data);
//     res.status(201).json({ success: true, schedule });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const createSchedule = async (req, res) => {
  try {
    const data = req.body;

    // 🟢 super_admin → allow body me salonId ya freelancerId
    if (req.user.role === "super_admin") {
      if (!data.salonId && !data.freelancerId) {
        return res.status(400).json({ message: "SalonId or FreelancerId is required" });
      }
    }

    // 🟢 admin → apne salon ka schedule banayega
    if (req.user.role === "admin") {
      data.salonId = req.user.salonId; // 🔹 ye line zaroori hai
    }

    // 🟢 freelancer → apna khud ka schedule banayega
    if (req.user.role === "freelancer") {
      data.freelancerId = req.user.freelancerId; // 🔹 ye line zaroori hai
    }

    const schedule = new Schedule(data);
    await schedule.save();

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ message: "Error creating schedule", error: error.message });
  }
};


// export const getAllSchedules = async (req, res) => {
//   try {
//     if (["super_admin"].includes(req.user.role)) {
//       const schedules = await Schedule.find().populate("salonId freelancerId staff service");
//       return res.json({ success: true, schedules });
//     }
//     if (req.user.role === "admin") {
//       const schedules = await Schedule.find({ salonId: req.user.salonId }).populate("staff service");
//       return res.json({ success: true, schedules });
//     }
//     if (req.user.role === "freelancer") {
//       const schedules = await Schedule.find({ freelancerId: req.user.freelancerId }).populate("staff service");
//       return res.json({ success: true, schedules });
//     }
//     return res.status(403).json({ success: false, message: "Forbidden" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const getAllSchedules = async (req, res) => {
  try {
    if (req.user.role === "super_admin") {
      const schedules = await Schedule.find()
        .populate("salonId freelancerId")
        .populate("slots.staff")
        .populate("slots.service");

      return res.json({ success: true, schedules });
    }

    if (req.user.role === "admin") {
      const schedules = await Schedule.find({ salonId: req.user.salonId })
        .populate("slots.staff")
        .populate("slots.service");

      return res.json({ success: true, schedules });
    }

    if (req.user.role === "freelancer") {
      const schedules = await Schedule.find({ freelancerId: req.user.freelancerId })
        .populate("slots.staff")
        .populate("slots.service");

      return res.json({ success: true, schedules });
    }

    return res.status(403).json({ success: false, message: "Forbidden" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// export const getScheduleById = async (req, res) => {
//   try {
//     const schedule = await Schedule.findById(req.params.id).populate("staff service");
//     if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

//     // Permission check
//     if (
//       ["super_admin"].includes(req.user.role)
//       || (req.user.role === "admin" && String(schedule.salonId) === String(req.user.salonId))
//       || (req.user.role === "freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
//     ) {
//       return res.json({ success: true, schedule });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate("salonId freelancerId")
      .populate("slots.staff")
      .populate("slots.service");

    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    // Permission check
    if (
      req.user.role === "super_admin" ||
      (req.user.role === "admin" && String(schedule.salonId?._id || schedule.salonId) === String(req.user.salonId)) ||
      (req.user.role === "freelancer" && String(schedule.freelancerId?._id || schedule.freelancerId) === String(req.user.freelancerId))
    ) {
      return res.json({ success: true, schedule });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getScheduleBySalonId = async (req, res) => {
  try {
    const salonId = req.params.id;  
    const schedules = await Schedule.find({ salonId })
      .populate("salonId freelancerId")
      .populate("slots.staff")
      .populate("slots.service"); 
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const updateSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    if (
      ["super_admin"].includes(req.user.role)
      || (req.user.role === "admin" && String(schedule.salonId) === String(req.user.salonId))
      || (req.user.role === "freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
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
      ["super_admin"].includes(req.user.role)
      || (req.user.role === "admin" && String(schedule.salonId) === String(req.user.salonId))
      || (req.user.role === "freelancer" && String(schedule.freelancerId) === String(req.user.freelancerId))
    ) {
      await schedule.deleteOne();
      res.json({ success: true, message: "Schedule deleted" });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
