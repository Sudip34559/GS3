import express from 'express'
import {
    createTestimonial,
    getAllTestimonial,
    deleteTestimonial,
    updateTestimonial
} from "../controllers/testimonialController.js"

import { upload } from '../utils/upload.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import isAdmin from '../middlewares/isAdmin.js'

const router = express.Router();

router.post("/create", authMiddleware, isAdmin, upload.single("image"), createTestimonial);
router.get("/", getAllTestimonial);
router.put("/:id", authMiddleware, isAdmin, upload.single("image"), updateTestimonial);
router.delete("/:id", authMiddleware, isAdmin, deleteTestimonial);

export default router;