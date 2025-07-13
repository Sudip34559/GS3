import express from "express";
import { upload } from "../utils/upload.js";
import { createWork, getAllWorks, updateWorks, deleteWork } from "../controllers/workController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.fields([{ name: 'logo' }, { name: 'image' }]),createWork);
router.get("/", getAllWorks);
router.put("/:id", authMiddleware, isAdmin, upload.fields([{ name: 'logo' }, { name: 'image' }]),updateWorks);
router.delete("/:id",authMiddleware, isAdmin, deleteWork);

export default router;