import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
export const uploadToCloudinary = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: (req, file) =>
        Date.now() + "-" + file.originalname.split(".")[0],
    },
  });

  return multer({ storage });
};
