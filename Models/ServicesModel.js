const serviceSchema = new mongoose.Schema(
    {
        salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },

        price: { type: Number, required: true },
        discountPrice: { type: Number },
        duration: { type: Number, required: true },
        gender: { type: String, enum: ["male", "female", "unisex"], default: "unisex" },

        isActive: { type: Boolean, default: true },
        popular: { type: Boolean, default: false },

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
