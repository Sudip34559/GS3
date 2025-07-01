import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Data } from "../models/data.model.js";
import Groq from "groq-sdk";
import { Type } from "../models/type.model.js";

const addtData = asyncHandler(async (req, res) => {
  const { type, text } = req.body;
  const existedtype = await Type.findById(type);
  if (!existedtype) {
    throw new ApiError(400, "Type not exist");
  }
  const data = await Data.create({
    type: type,
    data: text,
  });
  return res.status(201).json(new ApiResponse(201, data, "success"));
});

export { addtData };
