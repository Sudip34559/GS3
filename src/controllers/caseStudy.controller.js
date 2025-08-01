import { CaseStudy, CaseStudyDetail } from "../models/caseStudy.model.js";
import Work from '../models/work.model.js';
import { ApiResponse } from '../utils/apiResponce.js';
import fs from "fs";
import path from "path";

/**
 * A robust helper function to safely construct full image URLs.
 * It now handles both Mongoose documents and plain JavaScript objects,
 * and correctly removes the 'public/' prefix from paths.
 * @param {object} doc - The Mongoose document or a plain object.
 * @param {object} req - The Express request object.
 * @returns {object} The document as a plain object with absolute image URLs.
 */
const addImageUrl = (doc, req) => {
    if (!doc) return null;
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

    const processImage = (imagePath) => {
        if (imagePath && typeof imagePath === 'string') {
            // --- THIS IS THE FIX ---
            // This now correctly removes 'public/' from the path, ensuring a valid URL.
            const cleanedPath = imagePath.replace(/\\/g, '/').replace('public/', '').replace(/^\//, '');
            return `${serverUrl}/${cleanedPath}`;
        }
        return null;
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
            _id: { $ne: caseStudyDoc.workId._id }
        }).select('_id title image caseStudyId');

        const caseStudy = addImageUrl(caseStudyDoc, req);
        const details = detailsDocs.map(d => addImageUrl(d, req));
        
        const relatedProjects = relatedProjectsDocs.map(p => {
            const projectObj = p.toObject();
            if (projectObj.image) {
                // The addImageUrl helper will now correctly format the URL
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

// ... other functions remain the same ...
export async function createCaseStudy(req, res) {
    try {
        const { workId, title, tagline, description, team, result } = req.body;
        const heroImage = req.file ? `case_study_images/${req.file.filename}` : null;
        if (!workId || !title || !description || !heroImage) {
            return res.status(400).json(new ApiResponse(400, null, "Work ID, title, description, and hero image are required"));
        }
        const slug = title.toLowerCase().replace(/\s+/g, "-") + '-' + Date.now();
        const caseStudy = await CaseStudy.create({
            workId, title, tagline, description, heroImage, team: JSON.parse(team || '[]'), result, slug
        });
        await Work.findByIdAndUpdate(workId, { caseStudyId: caseStudy._id });
        res.status(201).json(new ApiResponse(201, caseStudy, "Case Study created successfully"));
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
        const image = req.file ? `case_study_images/${req.file.filename}` : null;
        if (!caseStudyId || !title || !description || !image) {
            return res.status(400).json(new ApiResponse(400, null, "All credentials required"));
        }
        const caseStudyExists = await CaseStudy.findById(caseStudyId);
        if (!caseStudyExists) {
            return res.status(404).json(new ApiResponse(404, null, "Case Study not found"));
        }
        const detailDoc = await CaseStudyDetail.create({ caseStudyId, title, description, image });
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

    // Optionally remove the image file from the server
    if (detail.image) {
      const imagePath = path.join('public', detail.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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

    // Delete the main hero image
    if (caseStudy.heroImage) {
      const heroImagePath = path.join('public', caseStudy.heroImage);
      if (fs.existsSync(heroImagePath)) {
        fs.unlinkSync(heroImagePath);
      }
    }

    // Find and delete all associated detail images
    const details = await CaseStudyDetail.find({ caseStudyId: id });
    for (const detail of details) {
      if (detail.image) {
        const detailImagePath = path.join('public', detail.image);
        if (fs.existsSync(detailImagePath)) {
          fs.unlinkSync(detailImagePath);
        }
      }
    }

    // Delete the database records
    await CaseStudyDetail.deleteMany({ caseStudyId: id });
    await CaseStudy.findByIdAndDelete(id);

    // Unlink from the associated Work
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
