import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Object, default: {} },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    sentTo: { type: String, default: "all" }, // could be "all" or specific role
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
