import Testimonial from "../models/testimonial.model.js";
import { ApiResponse } from "../utils/apiResponce.js";

export async function createTestimonial(req, res) {
    const { name, position, discussion, rating } = req.body;
    const image = req.file ? `/testimonial_images/${req.file.filename}` : null;

    if (!name || !position || !discussion || !rating || !image) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const testimonial = await Testimonial.create({
        name,
        position,
        discussion,
        rating,
        image
    })
    res.status(201).json(new ApiResponse(201, testimonial, "Testimonial created"));

}

export async function getAllTestimonial(req, res) {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, testimonials, "Testimonials fetched"));
}

export async function deleteTestimonial(req, res) {
    const { id } = req.params;
    const deleted = await Testimonial.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Testimonial not found" })
    res.json(new ApiResponse(200, deleted, "Testimonial deleted"));
}

export async function updateTestimonial(req, res) {
    const { id } = req.params;
    const { name, position, discussion, rating } = req.body;

    const updateData = {
        ...(name && { name }),
        ...(position && { position }),
        ...(discussion && { discussion }),
        ...(rating && { rating }),
    }
    if(req.file) {
        updateData.image = `/testimonial_images/${req.file.filename}`;
    }

    try {
        const updated = await Testimonial.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        res.json(new ApiResponse(200, updated, "Testimonial updated Successfully"));

    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message })
    }
}