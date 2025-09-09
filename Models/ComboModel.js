const mongoose = require("mongoose");

const serviceComboSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: false,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: false,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    photo: {
      type: String, // URL or file path
      required: true,
    },

    // 👇 Many services inside one combo
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1, // e.g. same service 2 times
        },
      },
    ],

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // 👇 Discounts based on number of people booking this combo
    groupDiscounts: [
      {
        minPeople: { type: Number, required: true },
        maxPeople: { type: Number },
        discountPercentage: { type: Number, required: true },
      },
    ],

    // Event bookings (like weddings / corporate / parties)
    isEvent: {
      type: Boolean,
      default: false,
    },
    eventDetails: {
      eventType: {
        type: String,
        enum: ["wedding", "party", "corporate", "festival", "other"],
      },
      maxPeople: { type: Number },
      extraCharges: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceCombo", serviceComboSchema);
