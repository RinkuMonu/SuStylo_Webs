import Salon from "../Models/SalonModel.js";
import Service from "../Models/ServicesModel.js";
import Schedule from "../Models/ScheduleModel.js";


export const createSalon = async (req, res) => {
  try {
    const salon = await Salon.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getAllSalons = async (req, res) => {
//   try {
//     const salons = await Salon.find().populate("staff services referrals");

//     res.json({ success: true, salons });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getAllSalons = async (req, res) => {
  try {
    // Salon find karo aur staff, referrals populate karo
    const salons = await Salon.find().populate("staff referrals");

    // Har salon ke liye services fetch karke attach karo
    const salonsWithServices = await Promise.all(
      salons.map(async (salon) => {
        const services = await Service.find({ salonId: salon._id });
        return { ...salon.toObject(), services };
      })
    );

    res.json({ success: true, salons: salonsWithServices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getSalonById = async (req, res) => {
//   try {
//     const salon = await Salon.findById(req.params.id).populate("staff services referrals");
//     if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

//     res.json({ success: true, salon });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id).populate("staff referrals");
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    // services ko alag fetch karo (kyunki wo separate schema me hai)
    const services = await Service.find({ salonId: salon._id });

    res.json({ success: true, salon: { ...salon.toObject(), services } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// export const updateSalon = async (req, res) =>  {
//   try {
//     let salon;

//     // If Super Admin or Admin: can update any salon
//     if (["SuperAdmin", "Admin"].includes(req.user.role)) {
//       salon = await Salon.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     } else {
//       // Salon role: only own salon
//       salon = await Salon.findOneAndUpdate(
//         { _id: req.params.id, owner: req.user._id },
//         req.body,
//         { new: true }
//       );
//     }

//     if (!salon) return res.status(404).json({ success: false, message: "Salon not found or unauthorized" });

//     res.json({ success: true, salon });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


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

