import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

//import routes
import bannerRoutes from "./Routes/BannerRoute.js";
import notificationRoutes from "./Routes/NotificationRoutes.js";
import customerRoutes from "./Routes/CustomerRoute.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Routes
app.use("/api/banners", bannerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/customers", customerRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));