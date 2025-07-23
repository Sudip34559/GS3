import express from 'express'
import { getServices, addService, updateService, deleteService } from '../controllers/service.controller.js'
import { upload } from "../utils/upload.js";
import isAdmin from '../middlewares/isAdmin.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

router.get('/', getServices);
router.post('/addservices', authMiddleware, isAdmin, upload.single('image'), addService);

router.put('/update/:id', authMiddleware, isAdmin, upload.single('image'), updateService);

router.delete('/delete/:id', authMiddleware, isAdmin, deleteService);
export default router;
