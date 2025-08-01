import Team from "../models/team.model.js";
import { ApiResponse } from '../utils/apiResponce.js';
import path from "path";
import fs from "fs";

/**
 * Helper to add the full server URL to a team member's image path.
 */
const addImageUrl = (member, req) => {
    if (!member) return null;
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const obj = typeof member.toObject === 'function' ? member.toObject() : member;

    if (obj.image && typeof obj.image === 'string') {
        const cleanedPath = obj.image.replace(/\\/g, '/').replace('public/', '').replace(/^\//, '');
        obj.image = `${serverUrl}/${cleanedPath}`;
    }
    return obj;
};

export const createTeamMember = async (req, res) => {
    try {
        const { name, position, bio, github, linkedin } = req.body;
        // Save the path without 'public/' for consistency
        const imagePath = req.file ? `employee_images/${req.file.filename}` : "";

        if (!name || !position || !bio || !imagePath) {
            return res.status(400).json({ message: "Name, position, bio, and image are required" });
        }

        const newMember = await Team.create({
            name, position, bio, github, linkedin, image: imagePath
        });

        const memberWithUrl = addImageUrl(newMember, req);
        res.status(201).json(new ApiResponse(201, memberWithUrl, "Team member created successfully"));
    } catch (error) {
        console.error("Create Team Member Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export async function getAllTeamMembers(req, res) {
    try {
        const members = await Team.find().sort({ createdAt: -1 });
        // --- THIS IS THE FIX ---
        // Map over the members and add the full image URL to each one.
        const membersWithUrls = members.map(member => addImageUrl(member, req));
        res.status(200).json(new ApiResponse(200, membersWithUrls, "All Team Members fetched successfully"));
    } catch (error) {
        console.error("Get All Team Members Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

export const deleteTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await Team.findByIdAndDelete(id);
        if (!member) {
            return res.status(404).json({ message: "Team member not found" });
        }

        if (member.image) {
            const imagePath = path.join(process.cwd(), 'public', member.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        return res.status(200).json({ message: "Team member deleted successfully" });
    } catch (err) {
        console.error("Error deleting team member:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, bio, github, linkedin } = req.body;

        const updateData = { name, position, bio, github, linkedin };

        if (req.file) {
            updateData.image = `employee_images/${req.file.filename}`;
        }

        const updatedMember = await Team.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedMember) {
            return res.status(404).json({ message: "Team member not found" });
        }

        const memberWithUrl = addImageUrl(updatedMember, req);
        return res.status(200).json(new ApiResponse(200, memberWithUrl, "Team member updated successfully"));
    } catch (err) {
        console.error("Error updating team member:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};