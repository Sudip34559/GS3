import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    // ADDED: Storing the full message from the user
    message: {
        type: String,
        required: true,
    },
    // RENAMED: For clarity, this is the preview
    messagePreview: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;