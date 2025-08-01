import express from "express";
import { createTeamMember, getAllTeamMembers, updateTeamMember, deleteTeamMember } from "../controllers/teamController.js";
// --- THIS IS THE FIX ---
// Import the specific 'uploadEmployee' middleware.
import { uploadEmployee } from "../utils/upload.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

// Use the correct 'uploadEmployee' middleware for create and update routes.
router.post('/create', authMiddleware, isAdmin, uploadEmployee.single('image'), createTeamMember);
router.get('/all', getAllTeamMembers); 
router.delete("/delete/:id", authMiddleware, isAdmin, deleteTeamMember);
router.put("/update/:id", authMiddleware, isAdmin, uploadEmployee.single("image"), updateTeamMember);

export default router;