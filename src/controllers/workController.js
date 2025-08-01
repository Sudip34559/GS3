import Work from '../models/work.model.js';
import { ApiResponse } from '../utils/apiResponce.js';
import { CaseStudy } from '../models/caseStudy.model.js';

/**
 * A robust helper function to safely construct full image and logo URLs.
 * It checks if the path exists and is a string before processing.
 * @param {object} work - The Mongoose document for a work/project.
 * @param {object} req - The Express request object to get the server's base URL.
 * @returns {object} The work object with added imageUrl and logoUrl properties.
 */
const addUrlToWork = (work, req) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const workObj = work.toObject();

    // Defensive check: Ensure 'image' is a non-empty string before processing.
    if (workObj.image && typeof workObj.image === 'string') {
        const imagePath = workObj.image.replace(/\\/g, '/').replace('public/', '');
        workObj.imageUrl = `${serverUrl}/${imagePath}`;
    }

    // Defensive check: Ensure 'logo' is a non-empty string before processing.
    if (workObj.logo && typeof workObj.logo === 'string') {
        const logoPath = workObj.logo.replace(/\\/g, '/').replace('public/', '');
        workObj.logoUrl = `${serverUrl}/${logoPath}`;
    }

    return workObj;
};

// --- CRUD Functions ---

export async function createWork(req, res) {
    try {
        const { title, liveLink, caseStudyLink, isSelected } = req.body;
        const logo = req.files?.logo?.[0]?.path || null;
        const image = req.files?.image?.[0]?.path || null;

        if (!title || !image) {
            return res.status(400).json(new ApiResponse(400, null, "Title and Image are required"));
        }

        const selected = isSelected === 'true';

        const work = await Work.create({
            title,
            image,
            logo,
            liveLink,
            caseStudyLink, // Note: This field is on the model but not used in the final logic
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

        const updateData = {};
        if (title) updateData.title = title;
        if (liveLink) updateData.liveLink = liveLink;
        if (caseStudyLink) updateData.caseStudyLink = caseStudyLink;
        if (isSelected !== undefined) {
            updateData.isSelected = isSelected === 'true';
        }

        if (req.files?.logo?.[0]?.path) {
            updateData.logo = req.files.logo[0].path;
        }
        if (req.files?.image?.[0]?.path) {
            updateData.image = req.files.image[0].path;
        }

        const updated = await Work.findByIdAndUpdate(id, updateData, { new: true });

        if (!updated) {
            return res.status(404).json(new ApiResponse(404, null, "Work not found"));
        }

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
        const deleted = await Work.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json(new ApiResponse(404, null, "Work not found"));
        }

        // Add logic here to delete files from storage if needed
        // fs.unlinkSync(deleted.image);
        // fs.unlinkSync(deleted.logo);

        res.status(200).json(new ApiResponse(200, deleted, "Work deleted successfully"));

    } catch (error) {
        console.error("ERROR in deleteWork:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to delete work: " + error.message));
    }
}