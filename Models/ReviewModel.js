import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewFor: {
      type: String,
      enum: ["Salon", "Freelancer", "Staff"],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "reviewFor",
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

    editedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewFor: 1, targetId: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
