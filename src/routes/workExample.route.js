import express from 'express'
import { createWorkExample, getAllWorkExample, updateWorkExample, deleteWorkExample } from '../controllers/workExample.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import isAdmin from '../middlewares/isAdmin.js'
import { upload } from "../utils/upload.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.fields([{ name: "logo" }, { name: "image" },]), createWorkExample);
router.get("/", getAllWorkExample);
router.put("/:id", upload.fields([{ name: 'logo' }, { name: 'image' }]), updateWorkExample);
router.delete("/:id", deleteWorkExample);
export default router