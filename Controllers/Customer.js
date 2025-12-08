import Customer from "../Models/CustomerModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fast2sms from "fast-two-sms";
import Wallet from "../Models/WalletModel.js";

dotenv.config();

// export const registerCustomer = async (req, res) => {
//   try {
//     const { name, email, phone, password, gender, age } = req.body;

//     // Hash password first
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Profile Image (Cloudinary via multer)
//     let avatarUrl = null;
//     if (req.file && req.file.path) {
//       avatarUrl = req.file.path; // store full URL
//     }

//     // Check if a customer exists (even soft deleted)
//     let customer = await Customer.findOne({ $or: [{ email }, { phone }] });

//     if (customer) {
//       if (customer.isDeleted) {
//         // Reactivate old customer
//         customer.name = name;
//         customer.email = email;
//         customer.phone = phone;
//         customer.passwordHash = hashedPassword;
//         customer.gender = gender;
//         customer.age = age;
//         if (avatarUrl) customer.avatarUrl = avatarUrl;
//         customer.status = "active";
//         customer.isActive = true;
//         customer.isDeleted = false;
//         customer.isVerified = true; // optional: after OTP verification
//         await customer.save();

//         return res.status(200).json({
//           success: true,
//           message: "Customer re-registered successfully",
//           customer,
//         });
//       } else {
//         return res.status(400).json({ success: false, message: "User already exists!" });
//       }
//     }

//     // If no existing customer, create new
//     customer = await Customer.create({
//       name,
//       email,
//       phone,
//       passwordHash: hashedPassword,
//       gender,
//       age,
//       avatarUrl,
//       status: "active",
//       isActive: true,
//       isVerified: true, // optional
//     });

//     res.status(201).json({
//       success: true,
//       message: "Customer registered successfully",
//       customer,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, gender } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Profile Image (Cloudinary via multer)
    let avatarUrl = null;
    if (req.file && req.file.path) {
      avatarUrl = req.file.path;
    }

    // Check if a customer exists (even soft deleted)
    let customer = await Customer.findOne({ $or: [{ email }, { phone }] });

    if (customer) {
      if (customer.isDeleted) {
        // Reactivate old customer
        customer.name = name;
        customer.email = email;
        customer.phone = phone;
        customer.passwordHash = hashedPassword;
        customer.gender = gender;
        // customer.age = age;
        if (avatarUrl) customer.avatarUrl = avatarUrl;
        customer.status = "active";
        customer.isActive = true;
        customer.isDeleted = false;
        customer.isVerified = true;
        await customer.save();

        // ✅ Ensure wallet exists
        let wallet = await Wallet.findOne({ owner: customer._id, ownerModel: "User" });
        if (!wallet) {
          wallet = await Wallet.create({
            owner: customer._id,
            ownerModel: "User",
            balance: 0,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Customer re-registered successfully",
          customer,
          wallet,
        });
      } else {
        return res.status(400).json({ success: false, message: "User already exists!" });
      }
    }

    // If no existing customer, create new
    customer = await Customer.create({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      gender,
      avatarUrl,
      status: "active",
      isActive: true,
      isVerified: true,
    });

    // ✅ Create wallet on registration
    const wallet = await Wallet.create({
      owner: customer._id,
      ownerModel: "User",
      balance: 0,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer,
      wallet,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password, latitude, longitude } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials!" });
    }

    // Update last login timestamp
    customer.lastLoginAt = new Date();

    // Update coordinates if provided
    // Update coordinates if provided
    if (latitude !== undefined && longitude !== undefined) {
      // Address ke andar coordinates (GeoJSON)
      customer.address = customer.address || {};
      customer.address.coordinates = {
        type: "Point",
        coordinates: [longitude, latitude], // [lng, lat]
      };

      // Login location history
      customer.loginLocations = customer.loginLocations || [];
      customer.loginLocations.push({
        type: "Point",
        coordinates: [longitude, latitude], // [lng, lat]
        loggedAt: new Date(),
      });
    }


    await customer.save();

    const token = jwt.sign(
      { id: customer._id, role: "customer", name: customer.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, customer });
  } catch (err) {
    console.error("Login error:", err);
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

    if (!process.env.FAST2SMS_API_KEY) {
      return res.status(500).json({ success: false, message: "Fast2SMS API key missing" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    customer.otp = { code: otp, expiresAt };
    await customer.save();

    // Correct Fast2SMS call
    const response = await fast2sms.sendMessage({
      authorization: process.env.FAST2SMS_API_KEY,
      message: `Your OTP for password reset is ${otp}`,
      numbers: [phone],
      sender_id: "FSTSMS", // optional
      route: "v3",          // optional
    });

    console.log("Fast2SMS response:", response);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("sendOtp error:", err.response || err.message || err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// export const verifyOtp = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;
//     const customer = await Customer.findOne({ phone });

//     if (!customer || !customer.otp) {
//       return res.status(400).json({ success: false, message: "OTP not found!" });
//     }

//     if (customer.otp.code !== otp || customer.otp.expiresAt < new Date()) {
//       return res.status(400).json({ success: false, message: "Invalid or expired OTP!" });
//     }

//     res.json({ success: true, message: "OTP verified" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

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

    // ✅ Mark OTP verified for reset
    customer.otpVerifiedForReset = true;
    await customer.save();

    res.json({ success: true, message: "OTP verified successfully. You can now reset your password." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// export const resetPassword = async (req, res) => {
//   try {
//     const { phone, otp, newPassword } = req.body;
//     const customer = await Customer.findOne({ phone });

//     if (!customer || !customer.otp) {
//       return res.status(400).json({ success: false, message: "Invalid request!" });
//     }

//     if (customer.otp.code !== otp || customer.otp.expiresAt < new Date()) {
//       return res.status(400).json({ success: false, message: "Invalid or expired OTP!" });
//     }

//     customer.passwordHash = await bcrypt.hash(newPassword, 10);
//     customer.otp = null;
//     await customer.save();

//     res.json({ success: true, message: "Password reset successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Find the user whose OTP was verified
    const customer = await Customer.findOne({ otpVerifiedForReset: true });
    if (!customer) {
      return res.status(400).json({ success: false, message: "No OTP verified user found!" });
    }

    customer.passwordHash = await bcrypt.hash(newPassword, 10);
    customer.otp = null;
    customer.otpVerifiedForReset = false; // clear flag
    await customer.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
