import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true, default: "India" },
  coordinates: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }, // [lng, lat]
  },
});

const staffSchema = new mongoose.Schema(
  {
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },

    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    age: { type: Number, min: 0 },
    avatarUrl: { type: String },
    address: addressSchema,

    expertise: [{ type: String }], // skills/services
    experience: { type: Number, default: 0 }, // in years

    shiftStart: { type: String }, // "09:00 AM"
    shiftEnd: { type: String },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract"],
      default: "full_time",
    },

    status: { type: String, enum: ["active", "inactive", "blocked"], default: "active" },

    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }], // staff कौन services handle करता है

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
