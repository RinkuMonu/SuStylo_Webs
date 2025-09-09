const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        salonName: { type: String, required: true, trim: true },
        description: { type: String, trim: true },

        contact: {
            phone: { type: String, required: true, trim: true },
            email: { type: String, trim: true },
            website: { type: String, trim: true },
        },

        address: {
            street: { type: String, required: true, trim: true },
            area: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, trim: true },
            pinCode: { type: String, required: true, trim: true },
        },

        location: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], index: "2dsphere" }, // [lng, lat]
        },

        // ✅ Media
        photos: [{ type: String }], // salon images
        agreementDocs: [{ type: String }], // license/agreement uploads

        // ✅ Facilities
        facilities: [{ type: String }], // e.g., Parking, Wifi, AC

        // ✅ Chairs
        chairCount: { type: Number, default: 1 },
        chairs: [
            {
                number: { type: Number },
                status: { type: String, enum: ["available", "booked"], default: "available" },
            },
        ],

        // ✅ Status
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        isActive: { type: Boolean, default: false },

        // ✅ Ratings
        rating: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },

        // ✅ Analytics
        totalBookings: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
