import express from 'express'
import { createCaseStudy, addCaseStudyDetail, getAllCaseStudies, getCaseStudyDetails } from '../controllers/caseStudy.controller.js'
import { upload } from '../utils/upload.js'
import isAdmin from '../middlewares/isAdmin.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", getAllCaseStudies);//getting all case studies

router.get("/details/:id", getCaseStudyDetails);//getting the case study for scroll reveal effect

router.post("/create", authMiddleware, isAdmin, upload.single("heroImage"), createCaseStudy); //for main hero section

router.post("/detail/create", authMiddleware, isAdmin, upload.single("image"), addCaseStudyDetail); //for sticky scroll reveal section

export default router;