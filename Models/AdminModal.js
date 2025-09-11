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

// OTP sub-schema
const OtpSchema = new mongoose.Schema({
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Role constants
export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin", // Salon Owner
  FREELANCER: "freelancer",
};

// Main schema
const AdminSchema = new mongoose.Schema(
  {
    // Basic details
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    // Profile
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    age: { type: Number, min: 0 },
    avatarUrl: { type: String },
    images: [{ type: String }], // gallery

    // Address
    address: AddressSchema,

    // Role
    role: {
      type: String,
      enum: Object.values(ADMIN_ROLES),
      required: true,
      index: true,
    },

    // Hierarchy (who created whom)
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Super Admin → Admin, or Super Admin → Freelancer
      default: null,
    },

    // Salon Owner → Salon reference
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },

    // Freelancer → Assigned Area
    freelancerArea: {
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },

    // OTP for password reset / verification
    otp: OtpSchema,

    // Account status
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "pending_verification"],
      default: "active",
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    // Login security
    lastLoginAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },

    // Soft delete
    isDeleted: { type: Boolean, default: false },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto-add
  }
);

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
