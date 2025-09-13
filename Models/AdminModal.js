
// models/Admin.js
import mongoose from "mongoose";

// Role constants
export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin", // Salon Owner
  FREELANCER: "freelancer",
};

// Address sub-schema
const AddressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true, default: "India" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }, // [lng, lat]
  },
});

// OTP sub-schema (for password reset / verification)
const OtpSchema = new mongoose.Schema({
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Main Admin schema
const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    gender: { type: String, enum: ["male", "female", "other"] },
    age: { type: Number, min: 0 },
    avatarUrl: { type: String },
    images: [{ type: String }],

    address: AddressSchema,

    role: {
      type: String,
      enum: Object.values(ADMIN_ROLES),
      required: true,
      index: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },

    freelancerArea: {
      city: String,
      state: String,
      pincode: String,
    },

    otp: OtpSchema,

    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "pending_verification"],
      default: "active",
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    lastLoginAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },

    isDeleted: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", AdminSchema);
