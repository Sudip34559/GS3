import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponce.js';

export async function login(req, res) {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }


    if (user.role === 'admin' && email !== process.env.ADMIN_EMAIL) {
        console.log("Not authorized as admin");
        return res.status(403).json({ message: "Not authorized as admin" });
    }
    user.status = "Logged In"
    // user.lastSeen = new Date.now();
    await user.save();
    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie("token", token, { httpOnly: true });
    res.json(new ApiResponse(200, { token, role: user.role }, "Login successful"));
}


export async function logout(req, res) {

    const userId = req.user?._id;

    if(userId){
        await User.findByIdAndUpdate(userId,{status:"Logged Out"});
    }
    res.clearCookie("token");
    res.json(new ApiResponse(200, null, "Logged out successfully"));
}
export async function verifyToken(req, res) {
  // If the authMiddleware passes, it attaches the user to req.user.
  // We just need to send that user data back to the frontend.
  return res.status(200).json(new ApiResponse(200, { user: req.user }, "Token is valid."));
}
