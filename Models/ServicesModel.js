import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // अगर freelancer है

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    price: { type: Number, required: true },
    discountPrice: { type: Number },
    duration: { type: Number, required: true }, // in minutes
    gender: { type: String, enum: ["male", "female", "unisex"], default: "unisex" },

    image: { type: String },  // 🔹 Cloudinary image URL save करने के लिए field


    isActive: { type: Boolean, default: true },
    popular: { type: Boolean, default: false },

    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }], // कौन staff ये service देता है
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
