import express from 'express';
import {  login, logout,verifyToken } from '../controllers/authController.js';
import isAdmin from '../middlewares/isAdmin.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();



router.post('/login', login);
router.post('/logout', logout);
router.post('/admin/login',login);
router.get('/verify-token', authMiddleware, verifyToken)

export default router;
