import express from 'express'
import { submitContactForm,getAllContacts } from '../controllers/contact.controller.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import isAdmin from '../middlewares/isAdmin.js'

const router = express.Router();

router.post("/",submitContactForm);
router.get("/",authMiddleware,isAdmin,getAllContacts)

export default router;