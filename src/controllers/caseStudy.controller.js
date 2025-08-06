import { CaseStudy, CaseStudyDetail } from "../models/caseStudy.model.js";
import Work from '../models/work.model.js';
import { ApiResponse } from '../utils/apiResponce.js';
import fs from "fs";
import path from "path";

/**
 * Helper function to construct full image URLs for case study documents.
 */
const addImageUrl = (doc, req) => {
    if (!doc) return null;
    const serverUrl = process.env.BACKEND_URL;
    const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

    const processImage = (imagePath) => {
        if (imagePath && typeof imagePath === 'string') {
            // This ensures the path uses forward slashes for the URL
            const cleanedPath = imagePath.replace(/\\/g, '/');
            return `${serverUrl}/${cleanedPath}`;
        }
        return imagePath; // Return original if not a string
    };

    if (obj.heroImage) obj.heroImage = processImage(obj.heroImage);
    if (obj.image) obj.image = processImage(obj.image);
    
    return obj;
};


export async function getCaseStudyById(req, res) {
    try {
        const caseStudyDoc = await CaseStudy.findById(req.params.id).populate('workId');
        if (!caseStudyDoc) {
            return res.status(404).json(new ApiResponse(404, null, "Case Study not found"));
        }

        const detailsDocs = await CaseStudyDetail.find({ caseStudyId: caseStudyDoc._id });

        const relatedProjectsDocs = await Work.find({ 
            _id: { $ne: caseStudyDoc.workId?._id } // Added safe navigation
        }).select('_id title image caseStudyId');

        const caseStudy = addImageUrl(caseStudyDoc, req);
        const details = detailsDocs.map(d => addImageUrl(d, req));
        
        const relatedProjects = relatedProjectsDocs.map(p => {
            const projectObj = p.toObject();
            if (projectObj.image) {
                // Use the main addImageUrl helper for consistency
                projectObj.imageUrl = addImageUrl({ image: projectObj.image }, req).image;
                delete projectObj.image;
            }
            return projectObj;
        });

        res.status(200).json(new ApiResponse(200, { caseStudy, details, relatedProjects }, "Case Study fetched successfully"));
    } catch (error) {
        console.error("ERROR in getCaseStudyById:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to fetch case study: " + error.message));
    }
}

export async function createCaseStudy(req, res) {
    try {
        const { workId, title, tagline, description, team, result } = req.body;
        
        // FIX: Use the full path from Multer (req.file.path)
        const heroImagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

        if (!workId || !title || !description || !heroImagePath) {
            return res.status(400).json(new ApiResponse(400, null, "Work ID, title, description, and hero image are required"));
        }
        const slug = title.toLowerCase().replace(/\s+/g, "-") + '-' + Date.now();
        
        const caseStudyDoc = await CaseStudy.create({
            workId, title, tagline, description, heroImage: heroImagePath, team: JSON.parse(team || '[]'), result, slug
        });

        await Work.findByIdAndUpdate(workId, { caseStudyId: caseStudyDoc._id });
        
        const caseStudyWithUrl = addImageUrl(caseStudyDoc, req);
        res.status(201).json(new ApiResponse(201, caseStudyWithUrl, "Case Study created successfully"));
    } catch (error) {
        console.error("ERROR in createCaseStudy:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to create case study: " + error.message));
    }
}

export async function getAllCaseStudies(req, res) {
    try {
        const caseStudiesDocs = await CaseStudy.find().populate('workId', 'title').sort({ createdAt: -1 });
        const caseStudies = caseStudiesDocs.map(cs => addImageUrl(cs, req));
        res.status(200).json(new ApiResponse(200, caseStudies, "All case studies fetched successfully"));
    } catch (error) {
        console.error("ERROR in getAllCaseStudies:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to fetch case studies: " + error.message));
    }
}

export async function addCaseStudyDetail(req, res) {
    try {
        const { caseStudyId, title, description } = req.body;
        
        // FIX: Use the full path from Multer (req.file.path)
        const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

        if (!caseStudyId || !title || !description || !imagePath) {
            return res.status(400).json(new ApiResponse(400, null, "All fields and an image are required"));
        }
        const caseStudyExists = await CaseStudy.findById(caseStudyId);
        if (!caseStudyExists) {
            return res.status(404).json(new ApiResponse(404, null, "Case Study not found"));
        }
        const detailDoc = await CaseStudyDetail.create({ caseStudyId, title, description, image: imagePath });
        const detailWithUrl = addImageUrl(detailDoc, req);
        res.status(201).json(new ApiResponse(201, detailWithUrl, "Detail section added successfully"));
    } catch (error) {
        console.error("ERROR in addCaseStudyDetail:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to add detail section: " + error.message));
    }
}

export async function deleteCaseStudyDetail(req, res) {
  try {
    const { detailId } = req.params;
    const detail = await CaseStudyDetail.findByIdAndDelete(detailId);

    if (!detail) {
      return res.status(404).json(new ApiResponse(404, null, "Detail not found"));
    }

    // FIX: Use the full path from the DB to delete the file
    if (detail.image && fs.existsSync(detail.image)) {
        fs.unlinkSync(detail.image);
    }

    res.status(200).json(new ApiResponse(200, {}, "Detail deleted successfully"));
  } catch (error) {
    console.error("ERROR in deleteCaseStudyDetail:", error);
    res.status(500).json(new ApiResponse(500, null, "Failed to delete detail: " + error.message));
  }
}

export async function deleteCaseStudy(req, res) {
  try {
    const { id } = req.params;
    const caseStudy = await CaseStudy.findById(id);

    if (!caseStudy) {
      return res.status(404).json(new ApiResponse(404, null, "Case study not found"));
    }

    // FIX: Use the full path from the DB to delete the file
    if (caseStudy.heroImage && fs.existsSync(caseStudy.heroImage)) {
        fs.unlinkSync(caseStudy.heroImage);
    }

    const details = await CaseStudyDetail.find({ caseStudyId: id });
    for (const detail of details) {
      if (detail.image && fs.existsSync(detail.image)) {
          fs.unlinkSync(detail.image);
      }
    }

    await CaseStudyDetail.deleteMany({ caseStudyId: id });
    await CaseStudy.findByIdAndDelete(id);

    if (caseStudy.workId) {
        await Work.findByIdAndUpdate(caseStudy.workId, { $unset: { caseStudyId: "" } });
    }

    res.status(200).json(new ApiResponse(200, {}, "Case study and all associated details deleted successfully"));
  } catch (error) {
    console.error("ERROR in deleteCaseStudy:", error);
    res.status(500).json(new ApiResponse(500, null, "Failed to delete case study: " + error.message));
  }
}

export async function getCaseStudyDetails(req, res) {
    try {
        const { caseStudyId } = req.params;
        const detailsDocs = await CaseStudyDetail.find({ caseStudyId: caseStudyId });

        if (!detailsDocs) {
            return res.status(404).json(new ApiResponse(404, null, "Details not found for this case study"));
        }
        
        const details = detailsDocs.map(d => addImageUrl(d, req));
        res.status(200).json(new ApiResponse(200, details, "Details fetched successfully"));

    } catch (error) {
        console.error("ERROR in getCaseStudyDetails:", error);
        res.status(500).json(new ApiResponse(500, null, "Failed to fetch details: " + error.message));
    }
}
