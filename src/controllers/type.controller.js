import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponce.js";
import Groq from "groq-sdk";
import { Type } from "../models/type.model.js";
import { Data } from "../models/data.model.js";

const addtype = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const existedtype = await Type.findOne({ name });

  if (existedtype) {
    throw new ApiError(400, "Type allready exist");
  }
  const type = await Type.create({
    name,
    description,
  });
  return res.status(201).json(new ApiResponse(201, type, "success"));
});

const getAllTypes = asyncHandler(async (req, res) => {
  const types = await Type.find().sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, types, "All types Fetched Successfully"))
})

const updateType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required for an update.");
    }

    const updatedType = await Type.findByIdAndUpdate(
        id,
        { name, description },
        { new: true } // This option returns the updated document
    );

    if (!updatedType) {
        throw new ApiError(404, "Type not found.");
    }

    return res.status(200).json(new ApiResponse(200, updatedType, "Type updated successfully."));
});

const deleteType = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Data.deleteMany({ type: id });
  const deletedType = await Type.findByIdAndDelete(id);
  if (!deletedType) {
    throw new ApiError(404, "Type not found.");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Type and associated data deleted successfully"));
})

export { addtype, getAllTypes, updateType, deleteType };
