import Review from "../Models/ReviewModel.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";
import Staff from "../Models/StaffModel.js";

// Helper to recalc average rating
const recalcAverageRating = async (reviewFor, targetId) => {
  const reviews = await Review.find({ reviewFor, targetId, status: "approved" });

  if (!reviews.length) return 0;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Save average in target collection
  let Model;
  if (reviewFor === "Salon") Model = Salon;
  else if (reviewFor === "Freelancer") Model = Freelancer;
  else if (reviewFor === "Staff") Model = Staff;

  if (Model) {
    await Model.findByIdAndUpdate(targetId, { averageRating: avgRating.toFixed(1) });
  }

  return avgRating.toFixed(1);
};

// Create / update review
export const createOrUpdateReview = async (req, res) => {
  try {
    const { reviewFor, targetId, rating, comment } = req.body;
    const userId = req.user._id;

    let review = await Review.findOne({ reviewFor, targetId, user: userId });

    if (review) {
      // Update existing
      review.rating = rating;
      review.comment = comment;
      review.editedAt = new Date();
      review.status = "pending"; // reset approval on edit
    } else {
      review = new Review({ reviewFor, targetId, user: userId, rating, comment });
    }

    await review.save();

    res.json({ success: true, message: "Review submitted, pending approval", review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve review (Admin / SuperAdmin)
export const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    review.status = "approved";
    review.approvedBy = req.user._id;
    await review.save();

    // Recalculate average rating
    await recalcAverageRating(review.reviewFor, review.targetId);

    res.json({ success: true, message: "Review approved", review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject review
export const rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    review.status = "rejected";
    review.approvedBy = req.user._id;
    await review.save();

    res.json({ success: true, message: "Review rejected", review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a target (only approved)
export const getReviewsForTarget = async (req, res) => {
  try {
    const { reviewFor, targetId } = req.params;
    const reviews = await Review.find({ reviewFor, targetId, status: "approved" })
      .populate("user", "name avatarUrl")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
