import mongoose from "mongoose";
import Lead from "../Models/LeadModel.js";
import Admin, { ADMIN_ROLES } from "../Models/AdminModal.js";
import Salon from "../Models/SalonModel.js";
import Freelancer from "../Models/FreelancerModel.js";
import Customer from "../Models/CustomerModel.js";
import { generateStrongPassword } from "../utils/password.js";
import { sendCredentialsEmail } from "../utils/email.js";
import bcrypt from "bcryptjs";

async function resolveUserContact(userId) {
  if (!userId) return null;
  // try Admin
  let user = await Admin.findById(userId).lean();
  if (user) return { email: user.email, phone: user.phone, name: user.name };
  // try Customer
  user = await Customer.findById(userId).lean();
  if (user) return { email: user.email, phone: user.phone, name: user.name };
  return null;
}

export const createLead = async (req, res) => {
  try {
    const { 
      ownerName, 
      leadType, 
      salonName, 
      address,
      serviceArea,
      email, 
      contact 
    } = req.body;

    // 🔹 Validation
    if (!ownerName || !leadType || !email || !contact) {
      return res.status(400).json({ 
        success: false, 
        message: "ownerName, leadType, email and contact are required." 
      });
    }

    if (!["Salon", "Freelancer"].includes(leadType)) {
      return res.status(400).json({ 
        success: false, 
        message: "leadType must be 'Salon' or 'Freelancer'." 
      });
    }

    // 🔹 Lead object बनाओ
    const leadData = {
      ownerName,
      leadType,
      email,
      contact,
      status: "pending"
    };

    if (leadType === "Salon") {
      if (!salonName || !address) {
        return res.status(400).json({ 
          success: false, 
          message: "Salon leads require salonName and address." 
        });
      }
      leadData.salonName = salonName;
      leadData.address = address;
    }

    if (leadType === "Freelancer") {
      if (!serviceArea) {
        return res.status(400).json({ 
          success: false, 
          message: "Freelancer leads require serviceArea." 
        });
      }
      leadData.serviceArea = serviceArea;
    }

    // 🔹 Save lead
    const lead = new Lead(leadData);
    await lead.save();

    return res.status(201).json({ 
      success: true, 
      message: "Lead submitted successfully.", 
      lead 
    });
  } catch (err) {
    console.error("createLead:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message 
    });
  }
};

export const listLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const q = {};
    if (status) q.status = status;

    const leads = await Lead.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("approvedBy", "name email")
      .populate("convertedTo")
      .lean();

    const total = await Lead.countDocuments(q);
    return res.json({ success: true, leads, total });
  } catch (err) {
    console.error("listLeads:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

export const getLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id).populate("approvedBy", "name email").populate("convertedTo").lean();
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
    return res.json({ success: true, lead });
  } catch (err) {
    console.error("getLead:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

export const approveLead = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const file = req.file; // uploaded by uploadToCloudinary middleware
    const approverId = req.user.id;

    const lead = await Lead.findById(id).session(session);
    if (!lead) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Lead not found." });
    }
    if (lead.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Lead is not pending." });
    }

    // 🔹 Resolve contact info from lead.user or fallback to lead.email/contact
    let contact = await resolveUserContact(lead.user);
    if (!contact) {
      // Fallback: use lead fields
      contact = {
        email: lead.email,
        phone: lead.contact,
        name: lead.ownerName,
      };
    }

    if (!contact.email) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Lead does not have an email. Cannot create credentials." });
    }

    // 1) Check if Admin already exists with this email or phone
    let existingAdmin = await Admin.findOne({ $or: [{ email: contact.email }, { phone: contact.phone }] }).session(session);

    // 2) Create new Admin if not exist
    let plainPassword = null;
    if (!existingAdmin) {
      plainPassword = generateStrongPassword(10);
      const hashed = await bcrypt.hash(plainPassword, 12);

      const newAdmin = new Admin({
        name: lead.ownerName || contact.name || "Owner",
        email: contact.email,
        phone: contact.phone || "",
        passwordHash: hashed,
        role: lead.leadType === "Salon" ? ADMIN_ROLES.ADMIN : ADMIN_ROLES.FREELANCER,
        isActive: true,
        isVerified: true,
        parentId: approverId,
        createdBy: approverId,
      });

      existingAdmin = await newAdmin.save({ session });
    } else {
      // Update role if mismatch (skip for super admin)
      if (existingAdmin.role !== (lead.leadType === "Salon" ? ADMIN_ROLES.ADMIN : ADMIN_ROLES.FREELANCER)) {
        existingAdmin.role = lead.leadType === "Salon" ? ADMIN_ROLES.ADMIN : ADMIN_ROLES.FREELANCER;
        existingAdmin.updatedBy = approverId;
        await existingAdmin.save({ session });
      }
    }

    // 3) Create Salon or Freelancer
    let convertedDoc = null;
    if (lead.leadType === "Salon") {
      const salonPayload = {
        owner: existingAdmin._id,
        leadRef: lead._id,
        salonName: lead.salonName || lead.ownerName,
        description: lead.description || "",
        contact: {
          phone: existingAdmin.phone || contact.phone || "",
          email: existingAdmin.email || contact.email,
          website: "",
        },
        address: lead.address || {},
        location: (lead.address && lead.address.coordinates) ? lead.address.coordinates : undefined,
        approvalStatus: "approved",
        isActive: true,
      };
      if (file?.path) salonPayload.photos = [file.path];

      const salon = new (await import("../Models/SalonModel.js")).default(salonPayload);
      convertedDoc = await salon.save({ session });

      existingAdmin.salonId = convertedDoc._id;
      existingAdmin.updatedBy = approverId;
      await existingAdmin.save({ session });
    } else {
      const freelancerPayload = {
        user: existingAdmin._id,
        leadRef: lead._id,
        fullName: lead.ownerName,
        phone: existingAdmin.phone || contact.phone || "",
        email: existingAdmin.email || contact.email,
        location: (lead.address && lead.address.coordinates) ? lead.address.coordinates : undefined,
        approvalStatus: "approved",
        isActive: true,
      };
      if (file?.path) freelancerPayload.photos = [file.path];

      const freelancer = new (await import("../Models/FreelancerModel.js")).default(freelancerPayload);
      convertedDoc = await freelancer.save({ session });

      existingAdmin.freelancerArea = existingAdmin.freelancerArea || {};
      existingAdmin.updatedBy = approverId;
      existingAdmin.freelancerId = convertedDoc._id;
      await existingAdmin.save({ session });
    }

    // 4) Update lead
    lead.status = "approved";
    lead.approvedBy = approverId;
    lead.approvedAt = new Date();
    lead.convertedTo = convertedDoc._id;
    await lead.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 5) Send email with credentials
    try {
      if (plainPassword) {
        await sendCredentialsEmail({
          to: existingAdmin.email,
          name: existingAdmin.name,
          role: lead.leadType === "Salon" ? "admin" : "freelancer",
          password: plainPassword,
        });
      } else {
        await sendCredentialsEmail({
          to: existingAdmin.email,
          name: existingAdmin.name,
          role: lead.leadType === "Salon" ? "admin" : "freelancer",
          password: "You already have an account. Please login to access your new listing.",
        });
      }
    } catch (mailErr) {
      console.error("Error sending credentials email:", mailErr);
    }

    return res.json({ success: true, message: "Lead approved and account created/linked.", convertedTo: convertedDoc, admin: existingAdmin._id });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("approveLead:", err);
    return res.status(500).json({ success: false, message: "Approve lead failed: " + err.message });
  }
};

export const rejectLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
    if (lead.status !== "pending") return res.status(400).json({ success: false, message: "Lead must be pending to reject." });

    lead.status = "rejected";
    lead.approvedBy = req.user.id;
    lead.approvedAt = new Date();
    await lead.save();

    // optional: send notification to lead.user

    return res.json({ success: true, message: "Lead rejected." });
  } catch (err) {
    console.error("rejectLead:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};
