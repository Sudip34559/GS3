import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponce.js';

export async function register(req, res) {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });
    res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
}

export async function login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie("token", token, { httpOnly: true });
    res.json(new ApiResponse(200, { token }, "Login successful"));
}

export function logout(req, res) {
    res.clearCookie("token");
    res.json(new ApiResponse(200, null, "Logged out successfully"));
}