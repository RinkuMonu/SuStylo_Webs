const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        salon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salon",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },

        comment: {
            type: String,
            trim: true,
        },

        // Agar user apna review update kare to track ho
        editedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// 🔹 Har user ek salon pr sirf 1 review de sake
reviewSchema.index({ salon: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);