import express from 'express';
import { createEmployee } from '../controllers/employeeController.js';
import {  login, logout } from '../controllers/authController.js';
import isAdmin from '../middlewares/isAdmin.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post('/employee/register', authMiddleware, isAdmin, createEmployee); //route changed only admin can create employee

router.post('/login', login);
router.post('/logout', logout);
router.post('/admin/login',login);

export default router;
