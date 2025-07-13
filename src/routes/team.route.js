import express from "express";
import { createTeamMember } from "../controllers/teamController.js";
import { upload } from "../utils/upload.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from '../middlewares/isAdmin.js'

const router = express.Router();

router.post('/create',authMiddleware,isAdmin,upload.single('image'),createTeamMember);

export default router;