import Admin from "../Models/AdminModal.js";
import Freelancer from "../Models/FreelancerModel.js"; 
import Notification from "../Models/NotificationsModel.js";
// import admin from "../config/firebase.js";

export const sendNotificationToRole = async (req, res) => {
  try {
    const { title, body, data, roles } = req.body;
    // roles = ["admin"], ["freelancer"], or ["admin", "freelancer"]

    if (!title || !body || !roles || !roles.length) {
      return res.status(400).json({ success: false, message: "Title, body, and roles are required" });
    }

    let tokens = [];

    if (roles.includes("admin")) {
      const admins = await Admin.find({ deviceToken: { $ne: null } }).select("deviceToken");
      tokens.push(...admins.map(a => a.deviceToken));
    }

    if (roles.includes("freelancer")) {
      const freelancers = await Freelancer.find({ deviceToken: { $ne: null } }).select("deviceToken");
      tokens.push(...freelancers.map(f => f.deviceToken));
    }

    if (!tokens.length) {
      return res.status(400).json({ success: false, message: "No active device tokens found for the selected roles" });
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Save notification record in DB
    const notif = await Notification.create({
      title,
      body,
      data,
      sentBy: req.user ? req.user.id : null,
      sentTo: roles.join(","), // "admin", "freelancer" or "admin,freelancer"
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    res.json({
      success: true,
      message: "Notification sent to selected roles",
      result: response,
      notification: notif,
    });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments();

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { title, body, data } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { title, body, data },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification updated", notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
