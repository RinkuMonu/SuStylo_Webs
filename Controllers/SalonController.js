import Salon from "../Models/SalonModel.js";
import Service from "../Models/ServicesModel.js";
import Staff from "../Models/StaffModel.js";
import Schedule from "../Models/ScheduleModel.js";
import Review from "../Models/ReviewModel.js";

import slugify from "slugify";


export const createSalon = async (req, res) => {
  try {
    const salon = await Salon.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAllSalons = async (req, res) => {
  try {
    const {
      category,
      service,
      name,
      area,
      facility,
      lat,
      lng,
      radius,  // meters
      minRating,
      maxRating,
      minPrice,
      maxPrice

    } = req.query;

    let filter = {};

    // 🔹 Salon name partial search
    // if (name) {
    //   filter.salonName = { $regex: name, $options: "i" };
    // }

    if (name) {
  filter.slug = name.toLowerCase().trim();
}


    // 🔹 Area filter (area, city, state sab cover kare)
    if (area) {
      filter.$or = [
        { "address.area": { $regex: area, $options: "i" } },
        { "address.city": { $regex: area, $options: "i" } },
        { "address.state": { $regex: area, $options: "i" } }
      ];
    }


    // 🔹 Facilities filter
    if (facility) {
      filter.facilities = {
        $in: Array.isArray(facility) ? facility : [facility]
      };
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
            radius / 6371000 // 6371000 = earth radius in meters
          ],
        },
      };
    }

    // 🔹 Basic salon fetch
    let salons = await Salon.find(filter).populate("referrals");

    // 🔹 Category / Service / Price filter
    if (category || service || minPrice || maxPrice) {
      salons = await Promise.all(
        salons.map(async (salon) => {
          // All services of this salon
          const services = await Service.find({ salonId: salon._id }).populate("categoryId");

          let match = true;

          // Category filter
          if (category) {
            match = services.some(s =>
              s.categoryId?.name?.toLowerCase() === category.toLowerCase()
            );
          }

          // Service filter
          // if (service && match) {
          //   match = services.some(s =>
          //     s._id.toString() === service ||
          //     s.name?.toLowerCase().includes(service.toLowerCase())
          //   );
          // }

          // 🔥 Service filter with slug support
          if (service && match) {
            const serviceSlug = slugify(service, { lower: true, strict: true });

            match = services.some((s) => {
              const dbSlug = slugify(s.name, { lower: true, strict: true });

              return (
                s._id.toString() === service ||      // ID match
                dbSlug === serviceSlug ||            // Slug match
                s.name.toLowerCase().includes(service.toLowerCase()) // Name match
              );
            });
          }

          // Price filter
          if ((minPrice || maxPrice) && match) {
            match = services.some(s => {
              const priceToCheck = s.discountPrice || s.price;
              if (minPrice && priceToCheck < parseFloat(minPrice)) return false;
              if (maxPrice && priceToCheck > parseFloat(maxPrice)) return false;
              return true;
            });
          }

          if (match) {
            const staff = await Staff.find({ salonId: salon._id });
            return { ...salon.toObject(), services, staff };
          }
          return null;
        })
      );

      salons = salons.filter(Boolean);
    } else {
      // Agar category/service/price filter nahi hai to sab attach karo
      salons = await Promise.all(
        salons.map(async (salon) => {
          const services = await Service.find({ salonId: salon._id }).populate("categoryId");
          const staff = await Staff.find({ salonId: salon._id });
          return { ...salon.toObject(), services, staff };
        })
      );
    }

    res.json({ success: true, salons });
  } catch (err) {
    console.error("getAllSalons Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getSalonById = async (req, res) => {
//   try {
//     const salon = await Salon.findById(req.params.id).populate("referrals");
//     if (!salon) {
//       return res.status(404).json({ success: false, message: "Salon not found" });
//     }

//     // services + staff alag fetch karo
//     const services = await Service.find({ salonId: salon._id });
//     const staff = await Staff.find({ salonId: salon._id });

//     res.json({ success: true, salon: { ...salon.toObject(), services, staff } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id).populate("referrals");

    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    // Fetch related data
    const [services, staff, reviews] = await Promise.all([
      Service.find({ salonId: salon._id }),
      Staff.find({ salonId: salon._id }),
      Review.find({ reviewFor: "Salon", targetId: salon._id })
        .populate("user", "name email")  // optional
        .populate("approvedBy", "name") // optional
    ]);

    res.json({
      success: true,
      salon: {
        ...salon.toObject(),
        services,
        staff,
        reviews, // 👈 ADDING REVIEWS HERE
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateSalon = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // 🔹 Handle Cloudinary uploads
    if (req.files?.photos) {
      updateData.photos = req.files.photos.map(file => file.path);
    }

    if (req.files?.agreementDocs) {
      updateData.agreementDocs = req.files.agreementDocs.map(file => file.path);
    }

    let salon;

    // 🔹 If SuperAdmin/Admin → can update any salon
    if (["super_admin", "admin"].includes(req.user.role)) {
      salon = await Salon.findByIdAndUpdate(req.params.id, updateData, { new: true });
    } else {
      // 🔹 Salon role → can update only own salon
      salon = await Salon.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        updateData,
        { new: true }
      );
    }

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found or unauthorized",
      });
    }

    res.json({ success: true, salon });
  } catch (err) {
    console.error("UpdateSalon Error:", err); // पूरा error console में दिखेगा
    res.status(500).json({ success: false, error: err.message || err });
  }

};

export const deleteSalon = async (req, res) => {
  try {
    let salon;

    if (["super_admin", "admin"].includes(req.user.role)) {
      salon = await Salon.findByIdAndDelete(req.params.id);
    } else {
      salon = await Salon.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    }

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found or unauthorized" });

    res.json({ success: true, message: "Salon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleSalonStatus = async (req, res) => {
  try {
    let salon;

    if (["super_admin", "admin"].includes(req.user.role)) {
      salon = await Salon.findById(req.params.id);
    } else {
      salon = await Salon.findOne({ _id: req.params.id, owner: req.user._id });
    }

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found or unauthorized" });

    salon.isActive = !salon.isActive;
    await salon.save();

    res.json({ success: true, isActive: salon.isActive, message: `Salon is now ${salon.isActive ? "active" : "inactive"}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

