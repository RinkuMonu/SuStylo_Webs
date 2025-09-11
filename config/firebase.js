import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname setup (ESM ke liye)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service account JSON ka path
const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");

// JSON file read karo
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Firebase initialize
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;