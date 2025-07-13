import workExample from "../models/workExample.model.js";

import { ApiResponse } from "../utils/apiResponce.js";

export async function createWorkExample(req, res) {
    const { title, link, workId } = req.body;
    const logo = req.files?.logo?.[0]?.path || null;
    const image = req.files?.image?.[0]?.path || null;

    if (!title || !logo || !image || !link || !workId) {
        return res.status(400).json({ message: "All fields required" });
    }
    const example = await workExample.create({ title, logo, image, link, workId });
    res.status(201).json(new ApiResponse(201, example, "Work example cfeated Successfully"));
}

export async function getAllWorkExample(req, res) {
    const examples = await workExample.find().populate("workId").sort({ createdAt: -1 });
    res.json(new ApiResponse(200, examples, "work Example created"))
}

export async function updateWorkExample(req, res) {
    const { id } = req.params;
    const { title, link, workId } = req.body;
    const logo = req.files?.logo?.[0]?.path;
    const image = req.files?.image?.[0]?.path;
    const updated = await workExample.findByIdAndUpdate(id, {
    ...(title && { title }),
    ...(link && { link }),
    ...(workId && { workId }),
    ...(logo && { logo }),
    ...(image && { image })
  }, { new: true });
    if (!updated) return res.status(404).json({ message: "Work Example Not Found" })
    res.json(new ApiResponse(200, updated, "Work example updated"));
}

export async function deleteWorkExample(req, res) {
    const { id } = req.params;
    const deleted = await workExample.findByIdAndDelete(id);
    if (!deleted) res.status(404).json({ message: "Work Example Not Found" })
    res.json(new ApiResponse(200, deleted, "Work Example deletd Successfully"))
}