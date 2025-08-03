import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Data } from "../models/data.model.js";
import Groq from "groq-sdk";
import { Type } from "../models/type.model.js";

const addData = asyncHandler(async (req, res) => {
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

const getAllData = asyncHandler(async(req,res)=>{
  const allData = await Data.find().populate("type","name").sort({createdAt:-1});
  return res.status(200).json(new ApiResponse(200,allData,"All data fetched successfully "))
})

const updateData = asyncHandler(async (req,res) => {
  const {id} = req.params;
  const{text} = req.body;
  if (!text) {
        throw new ApiError(400, "Data content is required for an update.");
    }
    const updatedData = await Data.findByIdAndUpdate(id, { data: text }, { new: true });

    if (!updatedData) {
        throw new ApiError(404, "Data entry not found.");
    }

    return res.status(200).json(new ApiResponse(200,updatedData,"Data Updated Successfully"));
})

const deleteData = asyncHandler(async (req,res) => {
  const {id}  = req.params;
  const deletedData = await Data.findByIdAndDelete(id);

   if (!deletedData) {
        throw new ApiError(404, "Data entry not found.");
    }
        return res.status(200).json(new ApiResponse(200, {}, "Data deleted successfully."));

})

export { addData,getAllData,updateData,deleteData };
