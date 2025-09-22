import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema({
  type: { type: String, enum: ["salon", "freelancer"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, refPath: "type" }, // optional for global
  percentage: { type: Number, default: 10 },
  flat: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Commission = mongoose.model("Commission", commissionSchema);
export default Commission;
