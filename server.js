import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";

import bannerRoutes from "./Routes/BannerRoute.js";
import notificationRoutes from "./Routes/NotificationRoutes.js";
import customerRoutes from "./Routes/CustomerRoute.js";
import reviewRoutes from "./Routes/ReviewRoute.js";
import salonRoutes from "./Routes/SalonRoute.js";
import freelancerRoutes from "./Routes/FreelancerRoute.js";
import scheduleRoutes from "./Routes/ScheduleRoute.js";
import staffRoutes from "./Routes/StaffRoutes.js";
import attendanceRoutes from "./Routes/AttendanceRoutes.js";
import appointmentRoutes from "./Routes/AppointmentRoutes.js";

import leadRoutes from "./Routes/LeadRoute.js";
import adminRoutes from "./Routes/AdminRoutes.js";
import categoryRoutes from "./Routes/CategoryRoute.js";
import serviceRoutes from "./Routes/ServiceRoute.js";
import couponRoutes from "./Routes/CouponRoutes.js";
import serviceComboRoutes from "./Routes/ServiceComboRoutes.js";
import contactRoutes from "./Routes/ContactRoutes.js";
import referralRoutes from "./Routes/ReferRoute.js";
import payRoutes from "./Routes/PaymentRoutes.js";
import commissionRoutes from "./Routes/CommissionRoute.js";
import searchRoutes from "./Routes/searchRoutes.js";
import blogsRoutes from "./Routes/blogRoutes.js";


dotenv.config();
const app = express();
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/banners", bannerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/freelancer", freelancerRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/service-combos", serviceComboRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/pay", payRoutes);
app.use("/api/commission", commissionRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/blogs", blogsRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running...",
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));