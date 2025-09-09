const mongoose = require("mongoose");

const salonLeadSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        ownerName: {
            type: String,
            required: true,
            trim: true,
        },

        salonName: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            street: { type: String, required: true, trim: true },
            area: { type: String, required: true, trim: true },
            pinCode: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SalonLead", salonLeadSchema);