import Coupon from "../Models/CouponModel.js";

const generateCouponCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = Math.random().toString(36).substring(2, 10).toUpperCase();
    exists = await Coupon.findOne({ code });
  }

  return code;
};

export const createCoupon = async (req, res) => {
  try {
    const {
      title,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      startDate,
      endDate,
      usageLimit,
    } = req.body;

    // Auto generate code if not provided
    let code = req.body.code || await generateCouponCode();

    // Image Upload
    let imageUrl = req.file ? req.file.path : null;

    // NEW: role-based model assignment (Admin OR Freelancer)
    const createdByModel =
      req.user.role === "freelancer"
        ? "Freelancer"
        : "Admin";

    const coupon = new Coupon({
      title,
      description,
      discountType,
      discountValue,
      code,
      minOrderAmount,
      startDate,
      endDate,
      usageLimit,
      image: imageUrl,
      createdBy: req.user._id,
      createdByModel, // 🔥 IMPORTANT NEW FIELD
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("createdBy", "name email");

    // Auto-expire logic stays same
    const updatedCoupons = await Promise.all(
      coupons.map(async (coupon) => {
        if (new Date() > coupon.endDate ||
            (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit))
        {
          if (coupon.status !== "expired") {
            coupon.status = "expired";
            await coupon.save();
          }
        }
        return coupon;
      })
    );

    res.status(200).json({ success: true, coupons: updatedCoupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Expiry validation
    if (new Date() > coupon.endDate ||
        (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit))
    {
      if (coupon.status !== "expired") {
        coupon.status = "expired";
        await coupon.save();
      }
    }

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // New image uploaded
    if (req.file) {
      updates.image = req.file.path;
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, message: "Coupon updated", coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    // Expiry or usageLimit check
    if (new Date() > coupon.endDate ||
        (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit))
    {
      coupon.status = "expired";
      await coupon.save();
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }

    // Minimum order check
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Order must be at least ₹${coupon.minOrderAmount} to use this coupon`,
      });
    }

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// import Coupon from "../Models/CouponModel.js";


// const generateCouponCode = async () => {
//   let code;
//   let exists = true;

//   while (exists) {
//     // Random 8-char uppercase alphanumeric
//     code = Math.random().toString(36).substring(2, 10).toUpperCase();
//     exists = await Coupon.findOne({ code });
//   }

//   return code;
// };

// export const createCoupon = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       discountType,
//       discountValue,
//       minOrderAmount,
//       startDate,
//       endDate,
//       usageLimit,
//     } = req.body;

//     // Auto generate code if not provided
//     let code = req.body.code;
//     if (!code) {
//       code = await generateCouponCode();
//     }

//     // If image uploaded
//     let imageUrl = null;
//     if (req.file) {
//       imageUrl = req.file.path; // Cloudinary returns path as URL
//     }

//     const coupon = new Coupon({
//       title,
//       description,
//       discountType,
//       discountValue,
//       code,
//       minOrderAmount,
//       startDate,
//       endDate,
//       usageLimit,
//       image: imageUrl,
//       createdBy: req.user._id,
//     });

//     await coupon.save();

//     res.status(201).json({
//       success: true,
//       message: "Coupon created successfully",
//       coupon,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getAllCoupons = async (req, res) => {
//   try {
//     const coupons = await Coupon.find().populate("createdBy", "name email");

//     // Auto-expire check
//     const updatedCoupons = await Promise.all(
//       coupons.map(async (coupon) => {
//         if (new Date() > coupon.endDate || (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)) {
//           if (coupon.status !== "expired") {
//             coupon.status = "expired";
//             await coupon.save();
//           }
//         }
//         return coupon;
//       })
//     );

//     res.status(200).json({ success: true, coupons: updatedCoupons });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getCouponById = async (req, res) => {
//   try {
//     const coupon = await Coupon.findById(req.params.id).populate("createdBy", "name email");

//     if (!coupon) {
//       return res.status(404).json({ success: false, message: "Coupon not found" });
//     }

//     // Expiry check
//     if (new Date() > coupon.endDate || (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)) {
//       if (coupon.status !== "expired") {
//         coupon.status = "expired";
//         await coupon.save();
//       }
//     }

//     res.status(200).json({ success: true, coupon });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const updateCoupon = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // If new image uploaded
//     if (req.file) {
//       updates.image = req.file.path;
//     }

//     const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });

//     if (!coupon) {
//       return res.status(404).json({ success: false, message: "Coupon not found" });
//     }

//     res.status(200).json({ success: true, message: "Coupon updated", coupon });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const deleteCoupon = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const coupon = await Coupon.findByIdAndDelete(id);

//     if (!coupon) {
//       return res.status(404).json({ success: false, message: "Coupon not found" });
//     }

//     res.status(200).json({ success: true, message: "Coupon deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const validateCoupon = async (req, res) => {
//   try {
//     const { code, orderAmount } = req.body;
//     const coupon = await Coupon.findOne({ code });

//     if (!coupon) {
//       return res.status(404).json({ success: false, message: "Invalid coupon code" });
//     }

//     // Expiry check
//     if (new Date() > coupon.endDate || (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)) {
//       coupon.status = "expired";
//       await coupon.save();
//       return res.status(400).json({ success: false, message: "Coupon expired" });
//     }

//     // Min order amount check
//     if (orderAmount < coupon.minOrderAmount) {
//       return res.status(400).json({
//         success: false,
//         message: `Order must be at least ₹${coupon.minOrderAmount} to use this coupon`,
//       });
//     }

//     res.status(200).json({ success: true, coupon });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
