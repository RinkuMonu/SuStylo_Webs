import mongoose from "mongoose";

export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SALON_OWNER: "salon_owner",
  FREELANCER: "freelancer",
  SALON_STAFF: "salon_staff",
  CUSTOMER: "customer",
};

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

const UserSchema = new mongoose.Schema(
  {
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
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
      index: true,
    },

    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },
    region: {
      type: String,
      default: null,
    },

    skills: [{ type: String }],

    serviceAreas: [
      {
        city: String,
        pincode: String,
      },
    ],

    preferences: {
      genderPreference: { type: String, enum: ["male", "female", "any"] },
      defaultLocation: AddressSchema,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "pending_approval"],
      default: "active",
    },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
