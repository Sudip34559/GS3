import express from 'express';
import { getServices, addService, updateService, deleteService } from '../controllers/service.controller.js';
// Note: You will need to create and export 'uploadService' from your utils/upload.js
// It should be configured to save to a 'public/service_images' directory.
import { uploadService } from "../utils/upload.js"; 
import isAdmin from '../middlewares/isAdmin.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getServices);
router.post('/add', authMiddleware, isAdmin, uploadService.single('image'), addService);
router.put('/update/:id', authMiddleware, isAdmin, uploadService.single('image'), updateService);
router.delete('/delete/:id', authMiddleware, isAdmin, deleteService);

export default router;