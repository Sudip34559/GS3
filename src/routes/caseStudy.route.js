import express from 'express';
import { 
    createCaseStudy, 
    addCaseStudyDetail, 
    getAllCaseStudies, 
    getCaseStudyById, // Changed from getCaseStudyBySlug
    // ... import other functions
} from '../controllers/caseStudy.controller.js';
import { uploadCaseStudy } from '../utils/upload.js';
import isAdmin from '../middlewares/isAdmin.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all case studies (for admin list)
router.get("/", authMiddleware, isAdmin, getAllCaseStudies);

// GET a single case study by its ID (for the public display page)
router.get("/:id", getCaseStudyById); // CHANGED from /slug/:slug

// POST create a new case study
router.post("/create", authMiddleware, isAdmin, uploadCaseStudy.single("heroImage"), createCaseStudy);

// POST create a new detail section for a case study
router.post("/detail/create", authMiddleware, isAdmin, uploadCaseStudy.single("image"), addCaseStudyDetail);

// ... include your other PUT and DELETE routes

export default router;