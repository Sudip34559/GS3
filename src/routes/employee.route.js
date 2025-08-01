import express from "express";
import { createEmployee, getAllEmployee, deleteEmployee } from "../controllers/employeeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";
// Import the correct uploader for employees
import { uploadEmployee } from "../utils/upload.js";
import { updateEmployee } from "../controllers/employeeController.js";
const router = express.Router();

// Corrected Route: POST /api/v1/employees/register
// This now matches the base path and uses the correct uploader.
router.post('/register', authMiddleware, isAdmin, uploadEmployee.single('image'), createEmployee);

// GET /api/v1/employees/all
router.get("/all", authMiddleware, isAdmin, getAllEmployee);

// NEW: Route for deleting an employee
router.delete("/delete/:id", authMiddleware, isAdmin, deleteEmployee);
router.put("/update/:id", authMiddleware, isAdmin, uploadEmployee.single('image'), updateEmployee);

export default router;
