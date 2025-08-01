import express from 'express'
// Make sure you are exporting getContactById from your controller
import { submitContactForm, getAllContacts, getContactById } from '../controllers/contact.controller.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import isAdmin from '../middlewares/isAdmin.js'

const router = express.Router();

// POST /api/v1/contact - For the public form submission
router.post("/", submitContactForm);

// GET /api/v1/contact - For the admin to get the list of all contacts
router.get("/", authMiddleware, isAdmin, getAllContacts);

// --- THIS IS THE FIX ---
// GET /api/v1/contact/:id - For the admin to get details of a single contact
// This route matches the request from your "View Details" button.
router.get("/:id", authMiddleware, isAdmin, getContactById);

export default router;
