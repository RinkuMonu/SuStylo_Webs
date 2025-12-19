import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";
import Service from "../Models/ServicesModel.js";

export const getHomeData = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // 1. Nearby Salons Query Logic
    let nearbyQuery = { isActive: true, approvalStatus: "approved" };
    let spatialQuery = null;

    if (lat && lng) {
      spatialQuery = {
        location: {
          $near: {
            $geometry: { 
                type: "Point", 
                coordinates: [parseFloat(lng), parseFloat(lat)] 
            },
            $maxDistance: 50000, // 50 KM की रेंज
          },
        },
      };
    }

    // 2. Parallel Processing (Faster performance)
    const [nearbySalons, popularSalons, popularFreelancers, allServices] = await Promise.all([
      
      // A. पास के सलोन (Location based)
      Salon.find(lat && lng ? { ...nearbyQuery, ...spatialQuery } : nearbyQuery)
        .limit(10)
        .select("salonName slug contact address rating photos"),

      // B. टॉप रेटेड सलोन (Highest Rating first)
      Salon.find({ isActive: true, approvalStatus: "approved" })
        .sort({ "rating.average": -1, "rating.count": -1 })
        .limit(10)
        .select("salonName slug address rating photos"),

      // C. टॉप रेटेड फ्रीलांसर (Highest Rating first)
      Freelancer.find({ isActive: true, approvalStatus: "approved" })
        .sort({ "rating.average": -1, "rating.count": -1 })
        .limit(10)
        .select("fullName slug address rating photos experience"),

      // D. सभी एक्टिव सेवाएं (All Active Services)
      Service.find({ isActive: true })
        .populate("salonId", "salonName") 
        .populate("freelancerId", "fullName")
        .limit(20) // आप अपनी जरूरत के हिसाब से लिमिट हटा या बढ़ा सकते हैं
    ]);

    res.status(200).json({
      success: true,
      message: "Home data fetched successfully",
      data: {
        nearbySalons,
        popularSalons,
        popularFreelancers,
        services: allServices, // यहाँ अब सभी सेवाएं आ रही हैं
      },
    });
  } catch (error) {
    console.error("Home Data Fetch Error:", error);
    res.status(500).json({ 
        success: false, 
        message: "डेटा प्राप्त करने में त्रुटि हुई" 
    });
  }
};