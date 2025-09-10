import Banner from "../Models/BannerModel.js";

export const createBanner = async (req, res) => {
  try {
    const { page, section, image, createdBy } = req.body;

    const banner = new Banner({ page, section, image, createdBy });
    await banner.save();

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().populate("createdBy", "name email");
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!banner)
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });

    res.status(200).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { page, section, image } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { page, section, image },
      { new: true }
    );

    if (!banner)
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });

    res
      .status(200)
      .json({ success: true, message: "Banner updated successfully", banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner)
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
