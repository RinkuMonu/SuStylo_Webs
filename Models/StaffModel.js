import mongoose from "mongoose";

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

const StaffSchema = new mongoose.Schema(
  {
    // Hierarchy
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // staff can have child staff (optional)
      default: null,
    },

    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // freelancers saved in Admin model
      default: null,
    },

    // Profile
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    avatarUrl: { type: String },
    images: [{ type: String }],
    address: AddressSchema,

    // Professional details
    experience: { type: Number, min: 0, default: 0 }, // in years
    expertise: [{ type: String, trim: true }], // skills/services

    // References
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    attendances: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    // Work info
    shiftStart: { type: String }, // "09:00 AM"
    shiftEnd: { type: String },
    salary: { type: Number, default: 0 },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract"],
      default: "full_time",
    },

    // Account status
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    isVerified: { type: Boolean, default: false },

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
  { timestamps: true }
);

const Staff = mongoose.model("Staff", StaffSchema);

export default Staff;
