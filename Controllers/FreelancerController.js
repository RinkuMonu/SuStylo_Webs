// import Freelancer from "../Models/FreelancerModel.js";

// export const createFreelancer = async (req, res) => {
//   try {
//     const freelancer = await Freelancer.create({ ...req.body, user: req.user._id });
//     res.status(201).json({ success: true, freelancer });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getAllFreelancers = async (req, res) => {
//   try {
//     const freelancers = await Freelancer.find().populate("services employees referrals");
//     res.json({ success: true, freelancers });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getFreelancerById = async (req, res) => {
//   try {
//     const freelancer = await Freelancer.findById(req.params.id).populate("services employees referrals");
//     if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found" });
//     res.json({ success: true, freelancer });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const updateFreelancer = async (req, res) => {
//   try {
//     let freelancer;

//     if (["SuperAdmin", "Admin"].includes(req.user.role)) {
//       freelancer = await Freelancer.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     } else {
//       // Freelancer role: only own record
//       freelancer = await Freelancer.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
//     }

//     if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found or unauthorized" });

//     res.json({ success: true, freelancer });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const deleteFreelancer = async (req, res) => {
//   try {
//     let freelancer;

//     if (["SuperAdmin", "Admin"].includes(req.user.role)) {
//       freelancer = await Freelancer.findByIdAndDelete(req.params.id);
//     } else {
//       freelancer = await Freelancer.findOneAndDelete({ _id: req.params.id, user: req.user._id });
//     }

//     if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found or unauthorized" });

//     res.json({ success: true, message: "Freelancer deleted" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const toggleFreelancerStatus = async (req, res) => {
//   try {
//     let freelancer;

//     if (["SuperAdmin", "Admin"].includes(req.user.role)) {
//       freelancer = await Freelancer.findById(req.params.id);
//     } else {
//       freelancer = await Freelancer.findOne({ _id: req.params.id, user: req.user._id });
//     }

//     if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found or unauthorized" });

//     freelancer.isActive = !freelancer.isActive;
//     await freelancer.save();

//     res.json({ success: true, isActive: freelancer.isActive, message: `Freelancer is now ${freelancer.isActive ? "active" : "inactive"}` });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };





import Freelancer from "../Models/FreelancerModel.js";
import Service from "../Models/ServicesModel.js";
import Staff from "../Models/StaffModel.js";
import Review from "../Models/ReviewModel.js";
import Commission from "../Models/CommissionModel.js";


export const createFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, freelancer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getAllFreelancers = async (req, res) => {
//   try {
//     const freelancers = await Freelancer.find().populate("employees referrals");

//     const freelancersWithServices = await Promise.all(
//       freelancers.map(async (freelancer) => {
//         const services = await Service.find({ freelancerId: freelancer._id });
//         return { ...freelancer.toObject(), services };
//       })
//     );

//     res.json({ success: true, freelancers: freelancersWithServices });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const getAllFreelancers = async (req, res) => {
  try {
    const {
      category,
      service,
      name,
      area,
      lat,
      lng,
      radius,   // meters
      minRating,
      maxRating,
      minPrice,
      maxPrice
    } = req.query;

    let filter = {};

    // 🔹 Name partial search (on freelancer fullName)
    if (name) {
      filter.slug = { $regex: name, $options: "i" };
    }

    // 🔹 Area filter (like salons: city/state bhi cover kare)
    if (area) {
      filter.$or = [
        { "address.area": { $regex: area, $options: "i" } },
        { "address.city": { $regex: area, $options: "i" } },
        { "address.state": { $regex: area, $options: "i" } }
      ];
    }

    // 🔹 Rating filter
    if (minRating || maxRating) {
      filter["rating.average"] = {};
      if (minRating) filter["rating.average"].$gte = parseFloat(minRating);
      if (maxRating) filter["rating.average"].$lte = parseFloat(maxRating);
    }

    // 🔹 Nearby filter
    if (lat && lng && radius) {
      filter.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            radius / 6371000 // radius in meters / earth radius
          ],
        },
      };
    }

    // 🔹 Basic freelancer fetch
    let freelancers = await Freelancer.find(filter).populate("referrals");

    // 🔹 Category / Service / Price filter
    if (category || service || minPrice || maxPrice) {
      freelancers = await Promise.all(
        freelancers.map(async (freelancer) => {
          const services = await Service.find({ freelancerId: freelancer._id }).populate("categoryId");

          let match = true;

          // Category filter
          if (category) {
            match = services.some(s =>
              s.categoryId?.name?.toLowerCase() === category.toLowerCase()
            );
          }

          // Service filter
          if (service && match) {
            match = services.some(s =>
              s._id.toString() === service ||
              s.name?.toLowerCase().includes(service.toLowerCase())
            );
          }

          // Price filter
          if ((minPrice || maxPrice) && match) {
            match = services.some(s => {
              let ok = true;
              if (minPrice) ok = s.price >= parseFloat(minPrice);
              if (maxPrice) ok = ok && s.price <= parseFloat(maxPrice);
              return ok;
            });
          }

          if (match) {
            const staff = await Staff.find({ freelancerId: freelancer._id });
            return { ...freelancer.toObject(), services, staff };
          }
          return null;
        })
      );

      freelancers = freelancers.filter(Boolean);
    } else {
      // Agar category/service/price filter nahi hai to sab attach karo
      freelancers = await Promise.all(
        freelancers.map(async (freelancer) => {
          const services = await Service.find({ freelancerId: freelancer._id }).populate("categoryId");
          const staff = await Staff.find({ freelancerId: freelancer._id });
          return { ...freelancer.toObject(), services, staff };
        })
      );
    }

    res.json({ success: true, freelancers });
  } catch (err) {
    console.error("getAllFreelancers Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFreelancerById = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate("employees referrals");
    if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found" });
    // const services = await Service.find({ freelancerId: freelancer._id }).populate("categoryId");

    const rawServices = await Service.find({ freelancerId: freelancer._id }).populate("categoryId");
    const categorizedServices = rawServices.reduce((acc, service) => {
      if (service.categoryId && service.categoryId.name && service.gender) {
        const gender = service.gender.toLowerCase();
        const categoryName = service.categoryId.name;

        // 1. **acc[gender] check ab zaroori nahi hai, kyuki humne initial value mein set kar diya hai.**
        // Lekin agar koi unknown gender aata hai toh yeh abhi bhi important hai.

        // Agar service ka gender male/female ke alawa hai (jaise unisex), toh use dynamically add karein
        if (!acc[gender]) {
          acc[gender] = {};
        }

        const categoryInfo = service.categoryId.toObject();
        const serviceObject = service.toObject();
        delete serviceObject.categoryId;

        if (!acc[gender][categoryName]) {
          acc[gender][categoryName] = {
            category: categoryInfo,
            services: []
          };
        }
        acc[gender][categoryName].services.push(serviceObject);
      }
      return acc;
    }, { male: {}, female: {} });

    const reviews = await Review.find({ reviewFor: "Freelancer", targetId: freelancer._id, status: "approved" }).populate("user");
    freelancer.reviews = reviews;
    res.json({ success: true, freelancer: { ...freelancer.toObject(), services: categorizedServices, reviews: reviews } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateFreelancer = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // ✅ Handle nested objects properly
    if (req.body.contact) {
      updateData.contact = {
        phone: req.body.contact.phone,
        email: req.body.contact.email,
        website: req.body.contact.website,
      };
    }

    if (req.body.address) {
      updateData.address = {
        street: req.body.address.street,
        area: req.body.address.area,
        city: req.body.address.city,
        state: req.body.address.state,
        pinCode: req.body.address.pinCode,
        country: req.body.address.country || "India",
      };
    }

    if (req.body.location) {
      updateData.location = {
        type: "Point",
        coordinates: req.body.location.coordinates || [],
      };
    }


    // ✅ File uploads
    // if (req.files?.photos) {
    //   updateData.photos = req.files.photos.map((file) => file.path);
    // }

    // if (req.files?.agreementDocs) {
    //   updateData.agreementDocs = req.files.agreementDocs.map(
    //     (file) => file.path
    //   );
    // }

    // ✅ File uploads
    if (req.files?.photos) {
      updateData.photos = req.files.photos.map((file) => file.path);
    }

    if (req.files?.agreementDocs) {
      updateData.agreementDocs = req.files.agreementDocs.map(
        (file) => file.path
      );
    }


    let freelancer;

    // ✅ Super Admin / Admin can update any freelancer
    if (["super_admin", "admin"].includes(req.user.role)) {
      freelancer = await Freelancer.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      )
        .populate("services")
        .populate("employees")
        .populate("referrals")
        .populate("commission.commissionsHistory");
    } else {
      // ✅ Freelancer can only update his own profile
      freelancer = await Freelancer.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        updateData,
        { new: true }
      )
        .populate("services")
        .populate("employees")
        .populate("referrals")
        .populate("commission.commissionsHistory");
    }

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found or unauthorized",
      });
    }

    res.json({ success: true, freelancer });
  } catch (err) {
    console.error("UpdateFreelancer Error:", err);
    res
      .status(500)
      .json({ success: false, error: err.message || "Internal Server Error" });
  }
};

export const deleteFreelancer = async (req, res) => {
  try {
    let freelancer;

    if (["super_admin", "admin"].includes(req.user.role)) {
      freelancer = await Freelancer.findByIdAndDelete(req.params.id);
    } else {
      freelancer = await Freelancer.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    }

    if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found or unauthorized" });

    res.json({ success: true, message: "Freelancer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleFreelancerStatus = async (req, res) => {
  try {
    let freelancer;

    if (["super_admin", "admin"].includes(req.user.role)) {
      freelancer = await Freelancer.findById(req.params.id);
    } else {
      freelancer = await Freelancer.findOne({ _id: req.params.id, user: req.user._id });
    }

    if (!freelancer) return res.status(404).json({ success: false, message: "Freelancer not found or unauthorized" });

    freelancer.isActive = !freelancer.isActive;
    await freelancer.save();

    res.json({ success: true, isActive: freelancer.isActive, message: `Freelancer is now ${freelancer.isActive ? "active" : "inactive"}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
