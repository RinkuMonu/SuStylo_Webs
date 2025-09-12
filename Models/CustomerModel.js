import mongoose from "mongoose";

// Address sub-schema
const AddressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true, default: "India" },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

// OTP sub-schema (for password reset / verification)
const OtpSchema = new mongoose.Schema({
  code: { type: String, required: true }, // OTP code
  expiresAt: { type: Date, required: true }, // Expiry time
  createdAt: { type: Date, default: Date.now }, // When OTP generated
});

// Customer Schema
const CustomerSchema = new mongoose.Schema(
  {
    // Basic details
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true, // optional (not mandatory for all)
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    // Profile
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    age: { type: Number, min: 0 },
    avatarUrl: { type: String }, // profile picture
    images: [{ type: String }], // customer related images (gallery)

    // Address
    address: AddressSchema,

    loginLocations: [
      {
        lat: { type: Number },
        lng: { type: Number },
        loggedAt: { type: Date, default: Date.now },
      },
    ],

    // OTP (password reset / login verification)
    otp: OtpSchema,

    // Account status
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "pending_verification"],
      default: "active",
    },
    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }, // email/phone verified

    // Security & login
    lastLoginAt: { type: Date },
    loginAttempts: { type: Number, default: 0 }, // brute force protection
    lockedUntil: { type: Date }, // account lock time

    // Soft delete support
    isDeleted: { type: Boolean, default: false },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // jisne customer create kiya
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatically add hoga
  }
);

const Customer = mongoose.model("Customer", CustomerSchema);

export default Customer;
