const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true }, // e.g., Hair, Skin
        description: { type: String, trim: true },
        image: { type: String }, // category banner
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
