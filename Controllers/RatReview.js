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
// export const approveReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const review = await Review.findById(reviewId);
//     if (!review) return res.status(404).json({ success: false, message: "Review not found" });

//     review.status = "approved";
//     review.approvedBy = req.user._id;
//     await review.save();

//     // Recalculate average rating
//     await recalcAverageRating(review.reviewFor, review.targetId);

//     res.json({ success: true, message: "Review approved", review });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Approve review (Admin / SuperAdmin)
export const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    // 🔹 Super Admin → sab approve kar sakta hai
    if (req.user.role === "super_admin") {
      review.status = "approved";
      review.approvedBy = req.user._id;
      await review.save();
      await recalcAverageRating(review.reviewFor, review.targetId);
      return res.json({ success: true, message: "Review approved by Super Admin", review });
    }

    // 🔹 Salon Owner (admin)
    if (req.user.role === "admin") {
      if (review.reviewFor === "Salon") {
        // ✅ Check if salon belongs to this admin
        const salon = await Salon.findById(review.targetId);
        if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

        if (String(salon.owner) !== String(req.user._id)) {
          return res.status(403).json({ success: false, message: "You can only approve reviews for your own salon!" });
        }
      } else if (review.reviewFor === "Staff") {
        // ✅ Check if staff belongs to this admin's salon
        const staff = await Staff.findById(review.targetId).populate("salonId");
        if (!staff) {
          return res.status(404).json({ success: false, message: "Staff not found" });
        }

        // yaha `salonId` use karo (na ki staff.salon)
        if (!staff.salonId || String(staff.salonId.owner) !== String(req.user._id)) {
          return res.status(403).json({
            success: false,
            message: "You can only approve reviews for your own staff!",
          });
        }
      }

      // ✅ Agar yahan tak aa gaya, toh approve allowed hai
      review.status = "approved";
      review.approvedBy = req.user._id;
      await review.save();
      await recalcAverageRating(review.reviewFor, review.targetId);
      return res.json({ success: true, message: "Review approved", review });
    }

    return res.status(403).json({ success: false, message: "Unauthorized action" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Reject review
// export const rejectReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const review = await Review.findById(reviewId);
//     if (!review) return res.status(404).json({ success: false, message: "Review not found" });

//     review.status = "rejected";
//     review.approvedBy = req.user._id;
//     await review.save();

//     res.json({ success: true, message: "Review rejected", review });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Reject review (Admin / SuperAdmin)
export const rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    // 🔹 Super Admin → sab reject kar sakta hai
    if (req.user.role === "super_admin") {
      review.status = "rejected";
      review.approvedBy = req.user._id;
      await review.save();
      return res.json({
        success: true,
        message: "Review rejected by Super Admin",
        review,
      });
    }

    // 🔹 Salon Owner (admin)
    if (req.user.role === "admin") {
      if (review.reviewFor === "Salon") {
        const salon = await Salon.findById(review.targetId);
        if (!salon)
          return res.status(404).json({ success: false, message: "Salon not found" });

        if (String(salon.owner) !== String(req.user._id)) {
          return res.status(403).json({
            success: false,
            message: "You can only reject reviews for your own salon!",
          });
        }
      } else if (review.reviewFor === "Staff") {
        const staff = await Staff.findById(review.targetId).populate("salonId");
        if (!staff)
          return res.status(404).json({ success: false, message: "Staff not found" });

        // 🔹 yaha staff.salonId check karna hai
        if (!staff.salonId || String(staff.salonId.owner) !== String(req.user._id)) {
          return res.status(403).json({
            success: false,
            message: "You can only reject reviews for your own staff!",
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Salon admins cannot reject freelancer reviews!",
        });
      }

      // ✅ Agar yahan tak aa gaya toh reject allowed hai
      review.status = "rejected";
      review.approvedBy = req.user._id;
      await review.save();
      return res.json({ success: true, message: "Review rejected", review });
    }

    return res
      .status(403)
      .json({ success: false, message: "Unauthorized action" });
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
