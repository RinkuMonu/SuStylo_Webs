import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      enum: ["home", "about", "contact", "blog", "salons"],
      required: true,
    },
    section: {
      type: String,
      enum: ["hero", "footer", "sidebar", "topBanner", "promo"],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;