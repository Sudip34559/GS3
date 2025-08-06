import Work from '../models/work.model.js';
import { ApiResponse } from '../utils/apiResponce.js';
import fs from 'fs';
import path from 'path';

/**
 * Helper function to construct full image URLs.
 * It correctly prepends the backend URL to the path stored in the database.
 */
const addUrlToWork = (work, req) => {
    const serverUrl = process.env.BACKEND_URL;
    const workObj = work.toObject();

    // This logic assumes the full path (e.g., "public/work_images/...") is stored in the DB.
    if (workObj.image && typeof workObj.image === 'string') {
        const imagePath = workObj.image.replace(/\\/g, '/');
        workObj.imageUrl = `${serverUrl}/${imagePath}`;
    }

    if (workObj.logo && typeof workObj.logo === 'string') {
        const logoPath = workObj.logo.replace(/\\/g, '/');
        workObj.logoUrl = `${serverUrl}/${logoPath}`;
    }

    return workObj;
};

export async function createWork(req, res) {
    try {
        const { title, liveLink, caseStudyLink, isSelected } = req.body;
        
        // Use the full path from Multer, which includes "public/".
        const logoPath = req.files?.logo?.[0]?.path.replace(/\\/g, '/') || null;
        const imagePath = req.files?.image?.[0]?.path.replace(/\\/g, '/') || null;

        if (!title || !imagePath) {
            return res.status(400).json(new ApiResponse(400, null, "Title and Image are required"));
        }

        const selected = isSelected === 'true';

        const work = await Work.create({
            title,
            image: imagePath,
            logo: logoPath,
            liveLink,
            caseStudyLink,
            isSelected: selected
        });

        const workWithUrl = addUrlToWork(work, req);
        res.status(201).json(new ApiResponse(201, workWithUrl, "Work created successfully"));

    } catch (error) {
        console.error("ERROR in createWork:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to create work: " + error.message));
    }
}

export async function getAllWorks(req, res) {
    try {
        const works = await Work.find().sort({ createdAt: -1 }).populate('caseStudyId', '_id');
        const worksWithUrls = works.map(work => addUrlToWork(work, req));
        res.status(200).json(new ApiResponse(200, worksWithUrls, "All works fetched successfully"));
    } catch (error) {
        console.error("ERROR in getAllWorks:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to fetch works: " + error.message));
    }
}

export async function updateWork(req, res) {
    try {
        const { id } = req.params;
        const { title, liveLink, caseStudyLink, isSelected } = req.body;

        const workToUpdate = await Work.findById(id);
        if (!workToUpdate) {
            return res.status(404).json(new ApiResponse(404, null, "Work not found"));
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (liveLink) updateData.liveLink = liveLink;
        if (caseStudyLink) updateData.caseStudyLink = caseStudyLink;
        if (isSelected !== undefined) {
            updateData.isSelected = isSelected === 'true';
        }
        
        // Handle logo update: delete old, save new
        if (req.files?.logo?.[0]) {
            if (workToUpdate.logo && fs.existsSync(workToUpdate.logo)) {
                fs.unlinkSync(workToUpdate.logo);
            }
            updateData.logo = req.files.logo[0].path.replace(/\\/g, '/');
        }

        // Handle image update: delete old, save new
        if (req.files?.image?.[0]) {
            if (workToUpdate.image && fs.existsSync(workToUpdate.image)) {
                fs.unlinkSync(workToUpdate.image);
            }
            updateData.image = req.files.image[0].path.replace(/\\/g, '/');
        }

        const updated = await Work.findByIdAndUpdate(id, updateData, { new: true });
        const workWithUrl = addUrlToWork(updated, req);
        res.status(200).json(new ApiResponse(200, workWithUrl, "Work updated successfully"));

    } catch (error) {
        console.error("ERROR in updateWork:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to update work: " + error.message));
    }
}

export async function deleteWork(req, res) {
    try {
        const { id } = req.params;
        
        // --- THIS IS THE FIX ---
        // First, find the document to get the file paths.
        const workToDelete = await Work.findById(id);
        if (!workToDelete) {
            return res.status(404).json(new ApiResponse(404, null, "Work not found"));
        }

        // Delete the image file from the server if it exists.
        if (workToDelete.image && fs.existsSync(workToDelete.image)) {
            fs.unlinkSync(workToDelete.image);
        }

        // Delete the logo file from the server if it exists.
        if (workToDelete.logo && fs.existsSync(workToDelete.logo)) {
            fs.unlinkSync(workToDelete.logo);
        }

        // Finally, delete the document from the database.
        await Work.findByIdAndDelete(id);

        res.status(200).json(new ApiResponse(200, {}, "Work deleted successfully"));

    } catch (error) {
        console.error("ERROR in deleteWork:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to delete work: " + error.message));
    }
}
