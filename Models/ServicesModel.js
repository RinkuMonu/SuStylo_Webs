

import mongoose from "mongoose";
import slugify from "slugify";

const serviceSchema = new mongoose.Schema(
  {
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    duration: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "unisex"], default: "unisex" },
    image: { type: String },

    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],

    isActive: { type: Boolean, default: true },
    popular: { type: Boolean, default: false },

    // 🔹 New field
    atHome: { type: Boolean, default: false },
  },
  { timestamps: true }
);


// 🔥 Auto-generate slug from name
serviceSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});


const Service = mongoose.model("Service", serviceSchema);
export default Service;
