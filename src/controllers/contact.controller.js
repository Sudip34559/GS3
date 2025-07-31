
import Contact from '../models/contact.model.js';
import { ApiResponse } from '../utils/apiResponce.js';

export async function submitContactForm(req, res) {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }
        const regex = /^\S+@\S+\.\S+$/;
        if (!regex.test(email)) {
            return res.status(400).json({ message: "Invalid Email, Please retry" });
        }
        const wordCount = message.trim().split(/\s+/).length;
        if (wordCount > 150) {
            return res.status(400).json({ message: "Message must be under 150 words." });
        }

        // Generate a preview from the full message
        const preview = message.trim().split(/\s+/).slice(0, 20).join(" ") + (wordCount > 20 ? "..." : "");

        const contact = await Contact.create({
            name,
            email,
            message, // Save the full message
            messagePreview: preview // Save the generated preview
        });

        res.status(201).json(new ApiResponse(201, contact, "Message received successfully"));
    } catch (err) {
        console.error("Error in submitContactForm:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

export async function getAllContacts(req, res) {
    try {
        // Now fetching the full message as well for the admin
        const contacts = await Contact.find().select("-message").sort({ createdAt: -1 });
        res.json(new ApiResponse(200, contacts, "Contacts fetched successfully"));
    } catch (err) {
        console.error("Error in getAllContacts:", err);
        res.status(500).json({ message: "Server error" });
    }
}

// NEW: Function to get a single contact's full details
export async function getContactById(req, res) {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json(new ApiResponse(404, null, "Contact not found"));
        }
        res.json(new ApiResponse(200, contact, "Contact details fetched successfully"));
    } catch (err) {
        console.error("Error in getContactById:", err);
        res.status(500).json({ message: "Server error" });
    }
}