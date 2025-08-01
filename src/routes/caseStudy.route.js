import express from 'express';
import { 
    createCaseStudy, 
    addCaseStudyDetail, 
    getAllCaseStudies, 
    getCaseStudyById, 
    deleteCaseStudy,
    deleteCaseStudyDetail,
    getCaseStudyDetails
} from '../controllers/caseStudy.controller.js';
import { uploadCaseStudy } from '../utils/upload.js';
import isAdmin from '../middlewares/isAdmin.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- CORRECTED ROUTES ---

// GET all case studies (for admin list)
router.get("/", authMiddleware, isAdmin, getAllCaseStudies);

// GET a single case study by its ID
router.get("/:id", getCaseStudyById); 

// POST to create a new case study
router.post("/create", authMiddleware, isAdmin, uploadCaseStudy.single("heroImage"), createCaseStudy);

// POST to add a detail section to a case study
router.post("/detail/create", authMiddleware, isAdmin, uploadCaseStudy.single("image"), addCaseStudyDetail);

// GET all details for a specific case study
// Path changed from "/case-studies/details/:caseStudyId" to "/details/:caseStudyId"
router.get("/details/:caseStudyId", getCaseStudyDetails);

// DELETE a specific detail section
// Path changed and security middleware added
router.delete("/details/:detailId", authMiddleware, isAdmin, deleteCaseStudyDetail);

// DELETE an entire case study by its ID
// Path changed from "/case-studies/:id" to "/:id" and security middleware added
router.delete("/:id", authMiddleware, isAdmin, deleteCaseStudy);


export default router;