import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      let allowedFormats = ["jpg", "jpeg", "png", "webp"];
      // अगर file का mimetype pdf है, तो pdf allow करें
      
      if (file.mimetype === "application/pdf") {
        allowedFormats.push("pdf");
      }
      return {
        folder: folderName,
        allowed_formats: allowedFormats,
        resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
        public_id: Date.now() + "-" + file.originalname.split(".")[0],
      };
    },
  });

  return multer({ storage });
};
