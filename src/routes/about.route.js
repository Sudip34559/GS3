import express from 'express'
import { upload } from "../utils/upload.js"
import { getAbout, updateStats, addTimeline } from '../controllers/about.controller.js'
import isAdmin from '../middlewares/isAdmin.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

router.get("/", getAbout);
router.put("/stats", authMiddleware, isAdmin, updateStats);
router.post("/timeline", authMiddleware, isAdmin, upload.array("images", 5), addTimeline);
export default router;