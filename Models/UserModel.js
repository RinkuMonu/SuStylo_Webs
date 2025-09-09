// models/User.js
const mongoose = require("mongoose");

// Role constants — centralize so logic consistent rahe
const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SALON_OWNER: "salon_owner",
  FREELANCER: "freelancer",
  SALON_STAFF: "salon_staff",
  CUSTOMER: "customer", // website user
};

// Sub-schema for address (optional)
const AddressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true, default: "India" },
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

// Main User schema
const UserSchema = new mongoose.Schema(
  {
    // Basic auth / identity
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: { type: String, required: true }, // hash, never plain text
    avatarUrl: { type: String }, // profile picture

    // Role management
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
      index: true,
    },

    // Role-specific fields
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null, // for salon_owner, salon_staff
    },
    region: {
      type: String,
      default: null, // for admins (which city/region they manage)
    },

    // For salon staff — which services can they perform (optional)
    skills: [{ type: String }],

    // For freelancers — service areas
    serviceAreas: [
      {
        city: String,
        pincode: String,
      },
    ],

    // For customers — preferences
    preferences: {
      genderPreference: { type: String, enum: ["male", "female", "any"] },
      defaultLocation: AddressSchema,
    },

    // Status flags
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "pending_approval"],
      default: "active",
    },
    isVerified: { type: Boolean, default: false }, // email/phone verification
    lastLoginAt: { type: Date },

    // Security / audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // track who created this admin (for super-admin)
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);
module.exports.USER_ROLES = USER_ROLES;
