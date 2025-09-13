// import mongoose from "mongoose";

// // Address sub-schema
// const AddressSchema = new mongoose.Schema({
//   street: { type: String, trim: true },
//   city: { type: String, trim: true },
//   state: { type: String, trim: true },
//   pincode: { type: String, trim: true },
//   country: { type: String, trim: true, default: "India" },
//   coordinates: {
//     lat: { type: Number },
//     lng: { type: Number },
//   },
// });

// // OTP sub-schema (for password reset / verification)
// const OtpSchema = new mongoose.Schema({
//   code: { type: String, required: true }, // OTP code
//   expiresAt: { type: Date, required: true }, // Expiry time
//   createdAt: { type: Date, default: Date.now }, // When OTP generated
// });

// // Customer Schema
// const CustomerSchema = new mongoose.Schema(
//   {
//     // Basic details
//     name: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       unique: true,
//       sparse: true, // optional (not mandatory for all)
//       lowercase: true,
//       trim: true,
//     },
//     phone: { type: String, required: true, unique: true, trim: true },
//     passwordHash: { type: String, required: true },

//     // Profile
//     gender: { type: String, enum: ["male", "female", "other"], default: null },
//     age: { type: Number, min: 0 },
//     avatarUrl: { type: String }, // profile picture
//     images: [{ type: String }], // customer related images (gallery)

//     // Address
//     address: AddressSchema,

//     loginLocations: [
//       {
//         lat: { type: Number },
//         lng: { type: Number },
//         loggedAt: { type: Date, default: Date.now },
//       },
//     ],

//     // OTP (password reset / login verification)
//     otp: OtpSchema,

//     // Account status
//     status: {
//       type: String,
//       enum: ["active", "inactive", "blocked", "pending_verification"],
//       default: "active",
//     },
//     isActive: { type: Boolean, default: false },
//     isVerified: { type: Boolean, default: false }, // email/phone verified

//     // Security & login
//     lastLoginAt: { type: Date },
//     loginAttempts: { type: Number, default: 0 }, // brute force protection
//     lockedUntil: { type: Date }, // account lock time

//     // Soft delete support
//     isDeleted: { type: Boolean, default: false },

//     // Metadata
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Admin", // jisne customer create kiya
//       default: null,
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Admin",
//       default: null,
//     },
//   },
//   {
//     timestamps: true, // createdAt, updatedAt automatically add hoga
//   }
// );

// const Customer = mongoose.model("Customer", CustomerSchema);

// export default Customer;




import mongoose from "mongoose";

// ----------------- Address Sub-Schema -----------------
const AddressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true, default: "India" },
  coordinates: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number], // [lng, lat]
      index: "2dsphere",
    },
  },
});

// ----------------- OTP Sub-Schema -----------------
const OtpSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
// TTL index → OTP auto delete after expiresAt
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ----------------- Customer Schema -----------------
const CustomerSchema = new mongoose.Schema(
  {
    // Basic details
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true, // optional for users who only register via phone
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    // Profile
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    age: { type: Number, min: 0 },
    avatarUrl: { type: String },
    images: [{ type: String }],

    // Address
    address: AddressSchema,

    // Track login locations
    loginLocations: [
      {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number] }, // [lng, lat]
        loggedAt: { type: Date, default: Date.now },
      },
    ],

    // OTP (password reset / verification)
    otp: OtpSchema,

    // Account status
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    // Security
    lastLoginAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },

    // Soft delete
    isDeleted: { type: Boolean, default: false },

    // Audit trail
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

// Index for phone search (fast lookup)
CustomerSchema.index({ phone: 1 });

// Model
const Customer = mongoose.model("Customer", CustomerSchema);

export default Customer;