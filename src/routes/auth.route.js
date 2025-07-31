import express from 'express';
import { createEmployee,getAllEmployee } from '../controllers/employeeController.js';
import {  login, logout } from '../controllers/authController.js';
import isAdmin from '../middlewares/isAdmin.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { upload } from '../utils/upload.js';


const router = express.Router();



router.post('/login', login);
router.post('/logout', logout);
router.post('/admin/login',login);


export default router;
