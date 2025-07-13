import Work from '../models/work.model.js'
import { ApiResponse } from '../utils/apiResponce.js'

export async function createWork(req, res) {
    const { title } = req.body;
    const logo = req.files?.logo?.[0]?.path || null;
    const image = req.files?.image?.[0]?.path || null;

    if (!title || !image || !logo) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const work = await Work.create({ title, image, logo });
    res.status(201).json(new ApiResponse(200, work, "Work created successfully"));
}

export async function getAllWorks(req, res) {
    const works = await Work.find().sort({ created: -1 });
    res.json(new ApiResponse(200, works, "All works"));
}
export async function updateWorks(req, res) {
    const { id } = req.params;
    const { title } = req.body;
    const logo = req.files?.logo?.[0]?.path;
    const image = req.files?.image?.[0]?.path;
    const updated = await Work.findByIdAndUpdate(id, {
        ...(title && { title }),
        ...(logo && { logo }),
        ...(image && { image })
    }, { new: true });


    if (!updated) return res.status(404).json({ message: "Work not found" });
    res.json(new ApiResponse(200, updated, "work Updated SUccessfully"));
}
export async function deleteWork(req, res) {
    const { id } = req.params;
    const deleted = await Work.findByIdAndDelete(id);
    if (!deleted) res.status(404).json({ message: "Work not found" });
    res.json(new ApiResponse(200, updated, "work Deleted SUccessfully"))
}