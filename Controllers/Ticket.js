import Ticket from "../models/Ticket.js";
import { ADMIN_ROLES } from "../models/Admin.js";
import Staff from "../models/Staff.js";
import Salon from "../models/Salon.js";


export const raiseTicket = async (req, res) => {
  try {
    const { subject, description, category, priority, salonId, bookingId, paymentId, walletTransactionId } = req.body;
    const userId = req.user._id; // from auth middleware
    const role = req.user.role;

    // --- Validations based on role ---
    if (role === "customer" || role === "staff") {
      if (!salonId) {
        return res.status(400).json({ success: false, message: "Salon ID is required for customer/staff ticket." });
      }

      // confirm salon exists
      const salon = await Salon.findById(salonId);
      if (!salon) {
        return res.status(404).json({ success: false, message: "Salon not found." });
      }
    }

    // generate ticket number
    const ticketNumber = "TKT-" + Date.now();

    const ticket = await Ticket.create({
      ticketNumber,
      subject,
      description,
      category,
      priority,
      raisedBy: userId,
      role,
      salonId: (role === "customer" || role === "staff") ? salonId : null,
      bookingId,
      paymentId,
      walletTransactionId,
      createdBy: userId,
    });

    return res.status(201).json({ success: true, message: "Ticket raised successfully", ticket });
  } catch (error) {
    console.error("Error raising ticket:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const replyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, attachments } = req.body;
    const userId = req.user._id;
    const role = req.user.role;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    // --- Ensure only valid people can reply ---
    // Customer/Staff reply only on tickets they raised
    if ((role === "customer" || role === "staff") && ticket.raisedBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "You can only reply to your own tickets." });
    }

    // Admin/Super Admin/Freelancer can reply freely (support team or higher roles)

    ticket.replies.push({
      message,
      attachments,
      repliedBy: userId,
      role,
    });

    ticket.updatedBy = userId;
    await ticket.save();

    return res.status(200).json({ success: true, message: "Reply added successfully", ticket });
  } catch (error) {
    console.error("Error replying to ticket:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { status, priority, role, salonId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (role) filter.role = role;
    if (salonId) filter.salonId = salonId;

    const tickets = await Ticket.find(filter)
      .populate("raisedBy", "name email phone")
      .populate("salonId", "salonName address")
      .populate("bookingId")
      .populate("paymentId")
      .populate("walletTransactionId")
      .populate("replies.repliedBy", "name email");

    return res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.params; // "in_progress" or "resolved"
    const { priority, role, salonId, raisedBy } = req.query;

    const filter = { status };

    if (priority) filter.priority = priority;
    if (role) filter.role = role;
    if (salonId) filter.salonId = salonId;
    if (raisedBy) filter.raisedBy = raisedBy;

    const tickets = await Ticket.find(filter)
      .populate("raisedBy", "name email phone")
      .populate("salonId", "salonName address")
      .populate("bookingId")
      .populate("paymentId")
      .populate("walletTransactionId")
      .populate("replies.repliedBy", "name email");

    return res.status(200).json({
      success: true,
      status,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets by status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getTicketsGrouped = async (req, res) => {
  try {
    const { salonId, role, raisedBy } = req.query;

    const filter = {};
    if (salonId) filter.salonId = salonId;
    if (role) filter.role = role;
    if (raisedBy) filter.raisedBy = raisedBy;

    // Tickets with status in_progress
    const inProgressTickets = await Ticket.find({ ...filter, status: "in_progress" })
      .populate("raisedBy", "name email phone")
      .populate("salonId", "salonName address")
      .populate("bookingId")
      .populate("paymentId")
      .populate("walletTransactionId")
      .populate("replies.repliedBy", "name email");

    // Tickets with status resolved
    const resolvedTickets = await Ticket.find({ ...filter, status: "resolved" })
      .populate("raisedBy", "name email phone")
      .populate("salonId", "salonName address")
      .populate("bookingId")
      .populate("paymentId")
      .populate("walletTransactionId")
      .populate("replies.repliedBy", "name email");

    return res.status(200).json({
      success: true,
      totalInProgress: inProgressTickets.length,
      totalResolved: resolvedTickets.length,
      inProgressTickets,
      resolvedTickets,
    });
  } catch (error) {
    console.error("Error fetching grouped tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};