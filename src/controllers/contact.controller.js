import Contact from '../models/contact.model.js'
import { ApiResponse } from '../utils/apiResponce.js'

export async function submitContactForm(req, res) {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: "All filed are Mandatory" });
        }
            const regex = /^\S+@\S+\.\S+$/;
            if (!regex.test(email)) {
                return res.status(400).json({ message: "Invalid Email, Please retry" })
            }
        const wordCount = message.trim().split(/\s+/).length;
        if (wordCount > 150) {
            return res.status(400).json({ message: "Message must be under 150 words." });
        }

        const preview = message.trim().split(/\s+/).slice(0, 150).join(" ");

        const contact = await Contact.create({
            name,
            email,
            messagePreview: preview
        })
        res.status(201).json(new ApiResponse(201, contact, "Message recieved Successfully"));
    } catch (err) {
        res.status(500).json({ message: "Internal server Error",err:err.message });
    }
}

export async function getAllContacts(req, res) {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(new ApiResponse(200, contacts, "Contacts fetched successfully"))
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}
