import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponce.js';

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role === 'admin' && email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ message: "Not authorized as admin" });
    }
    
    user.status = "Logged In";
    user.lastSeen = new Date(); // Corrected this line
    await user.save();
    
    const token = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
    
    res.cookie("token", token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

    res.json(new ApiResponse(200, { role: user.role }, "Login successful"));
}


export async function logout(req, res) {
    const userId = req.user?._id;
    if (userId) {
        await User.findByIdAndUpdate(userId, { status: "Logged Out" });
    }
    res.clearCookie("token");
    res.json(new ApiResponse(200, null, "Logged out successfully"));
}

export async function verifyToken(req, res) {

  return res.status(200).json(new ApiResponse(200, { user: req.user }, "Token is valid."));
}
