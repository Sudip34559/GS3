import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponce.js';
import fs from 'fs';
import path from 'path';


const addImageUrl = (employee, req) => {
    if (!employee) return null;
    const serverUrl = process.env.BACKEND_URL;
    const obj = typeof employee.toObject === 'function' ? employee.toObject() : employee;

    if (obj.image && typeof obj.image === 'string') {
        const cleanedPath = obj.image.replace(/\\/g, '/');

        obj.imageUrl = `${serverUrl}/${cleanedPath}`;
    }
    return obj;
};

export async function createEmployee(req, res) {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Missing required credentials" });
        }

        const existingEmployeeByEmail = await User.findOne({ email });
        if (existingEmployeeByEmail) {
            return res.status(400).json({ message: "Employee with this email already exists" });
        }

        const existingEmployeeByUsername = await User.findOne({ username });
        if (existingEmployeeByUsername) {
            return res.status(400).json({ message: "This username is already taken" });
        }

        const hashed = await bcrypt.hash(password, 10);


        const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : undefined;

        const employee = await User.create({
            username,
            email,
            password: hashed,
            role: role || 'employee',
            image: imagePath,
        });

        const employeeWithUrl = addImageUrl(employee, req);

        res.status(201).json(new ApiResponse(201, employeeWithUrl, "Employee Registered Successfully"));
    } catch (error) {
        console.error("Error in createEmployee:", error);
        res.status(500).json({ message: "Failed to register employee", error: error.message });
    }
}

export async function getAllEmployee(req, res) {
    try {
        const employees = await User.find({ role: { $ne: 'admin' } }).select('username email image role');
        const employeesWithUrls = employees.map(emp => addImageUrl(emp, req));
        res.status(200).json(new ApiResponse(200, employeesWithUrls, "Employees fetched Successfully"));
    } catch (error) {
        console.error("Error in getAllEmployee:", error);
        res.status(500).json({ message: 'Error fetching Employees' });
    }
}

export async function deleteEmployee(req, res) {
    try {
        const { id } = req.params;
        const employee = await User.findOneAndDelete({ _id: id, role: { $ne: 'admin' } });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }


        if (employee.image && fs.existsSync(employee.image)) {
            fs.unlinkSync(employee.image);
        }

        res.status(200).json(new ApiResponse(200, null, "Employee deleted successfully"));
    } catch (error) {
        console.error("Error in deleteEmployee:", error);
        res.status(500).json({ message: 'Error deleting employee' });
    }
}
export async function updateEmployee(req, res) {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;

        const employee = await User.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (username && username !== employee.username) {
            const existing = await User.findOne({ username });
            if (existing) return res.status(400).json({ message: "Username is already taken" });
            employee.username = username;
        }
        if (email && email !== employee.email) {
            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ message: "Email is already in use" });
            employee.email = email;
        }

        employee.role = role || employee.role;

        if (req.file) {

            if (employee.image && fs.existsSync(employee.image)) {
                fs.unlinkSync(employee.image);
            }
            employee.image = req.file.path.replace(/\\/g, '/');
        }

        await employee.save();

        const updatedEmployeeWithUrl = addImageUrl(employee, req);
        res.status(200).json(new ApiResponse(200, updatedEmployeeWithUrl, "Employee updated successfully"));

    } catch (error) {
        console.error("Error in updateEmployee:", error);
        res.status(500).json({ message: "Failed to update employee", error: error.message });
    }
}

export async function getEmployeeStatus(req, res){
    try {
        const employees = await User.find({role:{$ne:'admin'}}).select('username name role status image lastSeen')
        const employeesWithUrls = employees.map(emp => addImageUrl(emp, req));
        res.status(200).json(new ApiResponse(200, employeesWithUrls, "Employee statuses fetched successfully"));
    } catch (error) {
        res.status(500).json({ message: "Error fetching employee statuses", error: error.message });
    }
}

