import express from 'express'
import { uploadAbout } from "../utils/upload.js"
import { getAbout, updateStats, addTimeline,updateTimeline, deleteTimeline } from '../controllers/about.controller.js'
import isAdmin from '../middlewares/isAdmin.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

router.get("/", getAbout);
router.put("/stats",authMiddleware,isAdmin, updateStats);
router.post("/timeline",authMiddleware,isAdmin, uploadAbout.array("images", 5), addTimeline);
router.put("/timeline/:id",uploadAbout.single("images"),updateTimeline
)
router.delete('/timeline/:id', deleteTimeline);

export default router;