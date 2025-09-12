import Lead from "../models/Lead.js";
import Salon from "../models/Salon.js";
import Freelancer from "../models/Freelancer.js";
import User from "../models/User.js";

export const createLead = async (req, res) => {
    try {
        const { ownerName, leadType, salonName, address, serviceArea, servicesOffered } = req.body;

        const lead = await Lead.create({
            user: req.user._id, // assuming auth middleware sets req.user
            ownerName,
            leadType,
            salonName: leadType === "Salon" ? salonName : undefined,
            address,
            serviceArea,
            servicesOffered,
        });

        res.status(201).json({ success: true, message: "Lead created successfully", lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const lead = await Lead.findById(leadId);

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
        if (lead.status !== "pending")
            return res.status(400).json({ success: false, message: "Cannot update approved/rejected lead" });

        Object.assign(lead, req.body);
        await lead.save();

        res.json({ success: true, message: "Lead updated", lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveLead = async (req, res) => {
    try {
        const { leadId } = req.params;

        const lead = await Lead.findById(leadId);
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
        if (lead.status !== "pending")
            return res.status(400).json({ success: false, message: "Lead already processed" });

        // Set lead approved
        lead.status = "approved";
        lead.approvedBy = req.user._id; // super admin ID
        await lead.save();

        // Create live record in respective collection
        if (lead.leadType === "Salon") {
            await Salon.create({
                owner: lead.user,
                salonName: lead.salonName,
                address: lead.address,
                serviceArea: lead.serviceArea,
                services: lead.servicesOffered,
            });
        } else if (lead.leadType === "Freelancer") {
            await Freelancer.create({
                user: lead.user,
                name: lead.ownerName,
                serviceArea: lead.serviceArea,
                services: lead.servicesOffered,
            });
        }

        res.json({ success: true, message: "Lead approved and live record created", lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const rejectLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const lead = await Lead.findById(leadId);

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
        if (lead.status !== "pending")
            return res.status(400).json({ success: false, message: "Lead already processed" });

        lead.status = "rejected";
        lead.approvedBy = req.user._id;
        await lead.save();

        res.json({ success: true, message: "Lead rejected", lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllLeads = async (req, res) => {
    try {
        const leads = await Lead.find().populate("user", "firstName lastName email");
        res.json({ success: true, leads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
