import Admin, { ADMIN_ROLES } from "../Models/AdminModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fast2sms from "fast-two-sms";
import { generateStrongPassword } from "../utils/password.js";
import { sendCredentialsEmail } from "../utils/email.js";
import { uploadToCloudinary } from "../Middlewares/uploadMiddleware.js";



export const bootstrapSuperAdmin = async (req, res) => {
  try {
    const { name, email, phone, bootstrapSecret } = req.body;

    if (!process.env.BOOTSTRAP_SECRET) {
      return res.status(403).json({ success: false, message: "Super admin bootstrapping disabled. Set BOOTSTRAP_SECRET in .env to enable." });
    }
    if (bootstrapSecret !== process.env.BOOTSTRAP_SECRET) {
      return res.status(401).json({ success: false, message: "Invalid bootstrap secret." });
    }

    const existing = await Admin.findOne({ role: ADMIN_ROLES.SUPER_ADMIN });
    if (existing) {
      return res.status(400).json({ success: false, message: "Super admin already exists." });
    }

    const password = generateStrongPassword(12);
    const passwordHash = await bcrypt.hash(password, 12);

    const superAdmin = new Admin({
      name,
      email,
      phone,
      passwordHash,
      role: ADMIN_ROLES.SUPER_ADMIN,
      isActive: true,
      isVerified: true,
    });

    await superAdmin.save();

    try {
      await sendCredentialsEmail({
        to: email,
        name,
        role: "super_admin",
        password,
      });
    } catch (mailErr) {
      console.error("Bootstrap email error:", mailErr);
    }

    return res.status(201).json({ success: true, message: "Super admin created.", adminId: superAdmin._id });
  } catch (err) {
    console.error("bootstrapSuperAdmin:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    if (!admin.isActive || admin.isDeleted) {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive or deleted." });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role, salonId: admin.salonId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("loginAdmin:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

// 3️⃣ Send OTP for password reset
export const sendAdminOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log(req.body);
    const admin = await Admin.findOne({ phone });
    if (!admin || admin.isDeleted) return res.status(404).json({ success: false, message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    admin.otp = { code: otp, expiresAt };
    await admin.save();

    await fast2sms.sendMessage({
      authorization: process.env.FAST2SMS_API_KEY,
      message: `Your OTP for password reset is ${otp}`,
      numbers: [phone],
      sender_id: "FSTSMS",
      route: "v3",
    });

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// 4️⃣ Verify OTP
export const verifyAdminOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const admin = await Admin.findOne({ phone });
    if (!admin || !admin.otp) return res.status(400).json({ success: false, message: "OTP not found" });

    if (admin.otp.code !== otp || admin.otp.expiresAt < new Date()) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    return res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5️⃣ Reset Password
export const resetAdminPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const admin = await Admin.findOne({ phone });
    if (!admin || !admin.otp) return res.status(400).json({ success: false, message: "Invalid request" });

    if (admin.otp.code !== otp || admin.otp.expiresAt < new Date()) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    admin.otp = null;
    await admin.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6️⃣ Update Profile
export const updateProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, phone } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (phone) admin.phone = phone;

    // ✅ If file uploaded → Cloudinary URL set
    if (req.file && req.file.path) {
      admin.avatarUrl = req.file.path; // Cloudinary returns URL in .path
    }

    await admin.save();

    return res.json({ success: true, message: "Profile updated", admin });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminDetails = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId).select("-passwordHash -otp");
    if (!admin || admin.isDeleted) return res.status(404).json({ success: false, message: "Admin not found" });

    return res.json({ success: true, admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) return res.status(404).json({ success: false, message: "Admin not found" });

    admin.isDeleted = true;
    admin.isActive = false;
    await admin.save();

    return res.json({ success: true, message: "Admin soft deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};