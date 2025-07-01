import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponce.js";
import Groq from "groq-sdk";
import { Type } from "../models/type.model.js";

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

export { addtype };
