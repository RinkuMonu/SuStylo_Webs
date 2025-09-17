// import Staff from "../Models/StaffModel.js";
// import Salon from "../Models/SalonModel.js";
// import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";

// // Create staff (with image upload)
// export const createStaff = async (req, res) => {
//   try {
//     // image field maybe "avatar"
//     // Use uploadToCloudinary middleware in route before this controller
//     const { name, email, phone, gender, age, address, expertise, experience, shiftStart, shiftEnd, employmentType, services } = req.body;

//     // Who is creating?
//     let salonId;
//     if (["super_admin", "admin"].includes(req.user.role)) {
//       salonId = req.body.salonId;
//       if (!salonId) return res.status(400).json({ success: false, message: "salonId required" });
//     } else if (req.user.role === "Salon") {
//       salonId = req.user.salonId; // assuming payload has this
//     } else {
//       return res.status(403).json({ success: false, message: "Forbidden" });
//     }

//     const staffData = {
//       salonId,
//       name,
//       email,
//       phone,
//       gender,
//       age,
//       address,
//       expertise,
//       experience,
//       shiftStart,
//       shiftEnd,
//       employmentType,
//       services,
//     };

//     if (req.file && req.file.path) {
//       staffData.avatarUrl = req.file.path; // or req.file.secure_url etc depending cloudinary
//     }

//     const staff = await Staff.create(staffData);
//     res.status(201).json({ success: true, staff });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getAllStaff = async (req, res) => {
//   try {
//     let staffs;
//     if (["super_admin", "admin"].includes(req.user.role)) {
//       staffs = await Staff.find().populate("services salonId");
//     } else if (req.user.role === "Salon") {
//       staffs = await Staff.find({ salonId: req.user.salonId }).populate("services");
//     } else {
//       return res.status(403).json({ success: false, message: "Forbidden" });
//     }
//     res.json({ success: true, staffs });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getStaffById = async (req, res) => {
//   try {
//     const staff = await Staff.findById(req.params.id).populate("services salonId");
//     if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

//     if (
//       ["super_admin", "admin"].includes(req.user.role) ||
//       (req.user.role === "Salon" && String(staff.salonId) === String(req.user.salonId))
//     ) {
//       res.json({ success: true, staff });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized access" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const updateStaff = async (req, res) => {
//   try {
//     let staff = await Staff.findById(req.params.id);
//     if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

//     if (
//       ["super_admin", "admin"].includes(req.user.role) ||
//       (req.user.role === "Salon" && String(staff.salonId) === String(req.user.salonId))
//     ) {
//       // if image upload
//       if (req.file && req.file.path) {
//         req.body.avatarUrl = req.file.path;
//       }
//       Object.assign(staff, req.body);
//       await staff.save();
//       res.json({ success: true, staff });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const deleteStaff = async (req, res) => {
//   try {
//     const staff = await Staff.findById(req.params.id);
//     if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

//     if (
//       ["super_admin", "admin"].includes(req.user.role) ||
//       (req.user.role === "Salon" && String(staff.salonId) === String(req.user.salonId))
//     ) {
//       await staff.deleteOne();
//       res.json({ success: true, message: "Staff deleted" });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// }



import Staff from "../Models/StaffModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



// Create staff (with image upload)
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, gender, age, address, expertise, experience, shiftStart, shiftEnd, employmentType, services, salonId } = req.body;

    if (!password) return res.status(400).json({ success: false, message: "Password is required for staff login" });


    // Only Admin or Super Admin can create staff
    let assignedSalonId;
    if (["super_admin", "admin"].includes(req.user.role)) {
      assignedSalonId = salonId || req.user.salonId;
      if (!assignedSalonId) {
        return res.status(400).json({ success: false, message: "salonId required" });
      }
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const staffData = {
      salonId: assignedSalonId,
      name,
      email,
      password, // 🔹 save password

      phone,
      gender,
      age,
      address,
      expertise,
      experience,
      shiftStart,
      shiftEnd,
      employmentType,
      services,
    };

    if (req.file && req.file.path) {
      staffData.avatarUrl = req.file.path;
    }

    const staff = await Staff.create(staffData);
    res.status(201).json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//staff login
export const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: staff._id, role: "staff", salonId: staff.salonId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAllStaff = async (req, res) => {
  try {
    let staffs;
    if (req.user.role === "super_admin") {
      staffs = await Staff.find().populate("services salonId");
    } else if (req.user.role === "admin") {
      staffs = await Staff.find({ salonId: req.user.salonId }).populate("services salonId");
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.json({ success: true, staffs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getStaffById = async (req, res) => {
//   try {
//     const staff = await Staff.findById(req.params.id).populate("services salonId");
//     if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

//     if (
//       req.user.role === "super_admin" ||
//       (req.user.role === "admin" && String(staff.salonId) === String(req.user.salonId))
//     ) {
//       res.json({ success: true, staff });
//     } else {
//       return res.status(403).json({ success: false, message: "Unauthorized access" });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("services salonId");
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    const staffSalonId = staff.salonId?._id
      ? staff.salonId._id.toString()
      : staff.salonId.toString();

    if (
      req.user.role === "super_admin" ||
      (req.user.role === "admin" && staffSalonId === String(req.user.salonId))
    ) {
      return res.json({ success: true, staff });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateStaff = async (req, res) => {
  try {
    let staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    if (
      req.user.role === "super_admin" ||
      (req.user.role === "admin" && String(staff.salonId) === String(req.user.salonId))
    ) {
      if (req.file && req.file.path) {
        req.body.avatarUrl = req.file.path;
      }
      Object.assign(staff, req.body);
      await staff.save();
      res.json({ success: true, staff });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    if (
      req.user.role === "super_admin" ||
      (req.user.role === "admin" && String(staff.salonId) === String(req.user.salonId))
    ) {
      await staff.deleteOne();
      res.json({ success: true, message: "Staff deleted" });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
