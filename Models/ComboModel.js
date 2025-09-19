import mongoose from "mongoose";

const serviceComboSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
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
      type: String,
      required: true,
    },

    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    totalPrice: {
      type: Number, // sum of all service prices
      default: 0,
    },

    basePrice: {
      type: Number, // discounted price
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
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

const ServiceCombo = mongoose.model("ServiceCombo", serviceComboSchema);

export default ServiceCombo;
