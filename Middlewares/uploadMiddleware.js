// Middlewares/uploadMiddleware.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";

// -------------------- Cloudinary client (default export) --------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export default cloudinary;

// -------------------- multer-storage-cloudinary factory (named export) --------------------
export const uploadToCloudinary = (folderName = "app") => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      const allowedFormats = [
        "jpg","jpeg","png","webp","gif","bmp","svg",
        "pdf","doc","docx","mp4","mov","avi","mp3","wav"
      ];

      let resource_type = "image";
      if (file.mimetype.startsWith("video/")) resource_type = "video";
      else if (file.mimetype.startsWith("audio/")) resource_type = "raw";
      else if (file.mimetype === "application/pdf") resource_type = "raw";

      return {
        folder: folderName,
        allowed_formats: allowedFormats,
        resource_type,
        public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      };
    }
  });

  return multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
};

// -------------------- local-disk multer factory (named export) --------------------
export const uploadToLocal = () => {
  const uploadsRoot = path.join(process.cwd(), "uploads");

  if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let folder = "others";
      if (file.fieldname === "images") folder = "images";
      else if (file.fieldname === "coverImage") folder = "cover";
      else if (file.fieldname === "embedded") folder = "embedded";

      const dest = path.join(uploadsRoot, folder);
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
  const ext = path.extname(file.originalname);

  const baseName = path
    .basename(file.originalname, ext)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();

  cb(null, `${Date.now()}-${baseName}${ext}`);
}
  });

  return multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
};



// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// export const uploadToCloudinary = (folderName) => {
//   const storage = new CloudinaryStorage({
//     cloudinary,
//     params: (req, file) => {

//       // Allowed file extensions dynamically
//       const allowedFormats = [
//         "jpg", "jpeg", "png", "webp",
//         "gif", "bmp", "svg",
//         "pdf", "doc", "docx",
//         "mp4", "mov", "avi",
//         "mp3", "wav"
//       ];

//       const mime = file.mimetype;

//       // Detect resource type automatically
//       let resourceType = "image";

//       if (mime.startsWith("video/")) resourceType = "video";
//       else if (mime.startsWith("audio/")) resourceType = "raw";
//       else if (mime === "application/pdf") resourceType = "raw";
//       else if (mime.includes("document")) resourceType = "raw";

//       return {
//         folder: folderName,
//         allowed_formats: allowedFormats,
//         resource_type: resourceType,
//         public_id: Date.now() + "-" + file.originalname.split(".")[0],
//       };
//     },
//   });

//   return multer({
//     storage,
//     limits: {
//       fileSize: 50 * 1024 * 1024 // 50 MB per file
//     }
//   });
// };


// // import multer from "multer";
// // import { CloudinaryStorage } from "multer-storage-cloudinary";
// // import cloudinary from "../config/cloudinary.js";

// // export const uploadToCloudinary = (folderName) => {
// //   const storage = new CloudinaryStorage({
// //     cloudinary,
// //     params: (req, file) => {
// //       let allowedFormats = ["jpg", "jpeg", "png", "webp"];
// //       // अगर file का mimetype pdf है, तो pdf allow करें
      
// //       if (file.mimetype === "application/pdf") {
// //         allowedFormats.push("pdf");
// //       }
// //       return {
// //         folder: folderName,
// //         allowed_formats: allowedFormats,
// //         resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
// //         public_id: Date.now() + "-" + file.originalname.split(".")[0],
// //       };
// //     },
// //   });

// //   return multer({ storage });
// // };
