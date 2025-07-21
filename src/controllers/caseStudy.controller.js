import { CaseStudy, CaseStudyDetail } from "../models/caseStudy.model.js"
import { ApiResponse } from '../utils/apiResponce.js'

export async function createCaseStudy(req, res) {
    try {
        const { title, description } = req.body;
        const heroImage = req.file ? `/case_study_imges/${req.file.filename}` : null

        if (!title || !description || !heroImage) {
            return res.status(400).json({ message: "All credential required" });
        }

        const caseStudy = await CaseStudy.create({ title, description, heroImage });
        res.status(201).json(new ApiResponse(201, caseStudy, "Case Study Created successfully"));

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }

}

export async function getAllCaseStudies(req, res) {
    try {
        const caseStudies = await CaseStudy.find().sort({ createdAt: -1 });
        res.json(new ApiResponse(200, caseStudies, "Case Studies fetched"));
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

export async function addCaseStudyDetail(req, res) {
    try {
        const { caseStudyId, title, description } = req.body;
        const image = req.file ? `/case_study_images/${req.file.filename}` : null
        if (!caseStudyId || !title || !description || !image) {
            return res.status(400).json({ message: "All credential required" });
        }
        const caseStudyExists = await CaseStudy.findById(caseStudyId);

        if (!caseStudyExists) {
            return res.status(404).json({ message: "Case Study not found" });
        }

        const detail = await CaseStudyDetail.create({
            caseStudyId, title, description, image
        })
        res.status(201).json(new ApiResponse(201, detail, "Detail section Added"))

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export async function getCaseStudyDetails(req,res) {
    try {
        const {id} = req.params;
        const details = await CaseStudyDetail.find().sort({createdAt:-1});
        res.json(new ApiResponse(200,details,"Details Fetched"))
        
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}
