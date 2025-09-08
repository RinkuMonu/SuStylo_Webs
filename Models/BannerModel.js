const mongoose = require("mongoose");

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
            type: String, // file path
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);