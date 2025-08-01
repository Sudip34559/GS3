import express from "express";
import { uploadWork } from "../utils/upload.js";
// Renamed updateWorks to updateWork to reflect the single function
import { createWork, getAllWorks, updateWork, deleteWork } from "../controllers/workController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

// This allows both logo and image to be uploaded
const fileUpload = uploadWork.fields([{ name: 'logo', maxCount: 1 }, { name: 'image', maxCount: 1 }]);

// You might want to protect the create route as well
router.post("/", fileUpload, createWork);

router.get("/", getAllWorks);

// Use PUT for all updates
router.put("/:id", authMiddleware, isAdmin, fileUpload, updateWork);

router.delete("/:id", authMiddleware, isAdmin, deleteWork);

// The PATCH route is removed as its logic is now in the PUT handler.

export default router;