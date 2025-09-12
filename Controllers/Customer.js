import Customer from "../Models/CustomerModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fast2sms from "fast-two-sms";
dotenv.config();

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, gender, age } = req.body;

    // Check if user already exists
    const existing = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Profile Image (Cloudinary via multer)
    let avatarUrl = null;
    if (req.file && req.file.path) {
      avatarUrl = req.file.path;
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      gender,
      age,
      avatarUrl,
      status: "active",
      isActive: true,
      isVerified: true, // after OTP verification in real flow
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: customer._id, role: "customer", name: customer.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    customer.lastLoginAt = new Date();
    await customer.save();

    res.json({ success: true, token, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select("-passwordHash");
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file && req.file.path) {
      updates.avatarUrl = req.file.path;
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });

    res.json({ success: true, customer: updatedCustomer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);

    if (!customer) return res.status(404).json({ success: false, message: "User not found!" });

    customer.status = "inactive";
    customer.isDeleted = true;
    customer.isActive = false;
    await customer.save();

    res.json({ success: true, message: "Account deactivated (soft deleted)" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ success: false, message: "User not found!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    customer.otp = { code: otp, expiresAt };
    await customer.save();

    // Send OTP using Fast2SMS
    await fast2sms.sendMessage({
      authorization: process.env.FAST2SMS_API_KEY,
      message: `Your OTP for password reset is ${otp}`,
      numbers: [phone],
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const customer = await Customer.findOne({ phone });

    if (!customer || !customer.otp) {
      return res.status(400).json({ success: false, message: "OTP not found!" });
    }

    if (customer.otp.code !== otp || customer.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP!" });
    }

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const customer = await Customer.findOne({ phone });

    if (!customer || !customer.otp) {
      return res.status(400).json({ success: false, message: "Invalid request!" });
    }

    if (customer.otp.code !== otp || customer.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP!" });
    }

    customer.passwordHash = await bcrypt.hash(newPassword, 10);
    customer.otp = null;
    await customer.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
