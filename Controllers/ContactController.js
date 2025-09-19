import Contact from "../Models/ContactModel.js";


export const createContact = async (req, res) => {
  try {
    const { fullName, email, mobile, message } = req.body;

    if (!fullName || !email || !mobile || !message) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const newContact = new Contact({
      fullName,
      email,
      mobile,
      message,
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully!",
      contact: newContact,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving contact: " + error.message });
  }
};


export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching contacts: " + error.message });
  }
};


export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found!" });
    }

    res.status(200).json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching contact: " + error.message });
  }
};


export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found!" });
    }

    res.status(200).json({ success: true, message: "Contact deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting contact: " + error.message });
  }
};
