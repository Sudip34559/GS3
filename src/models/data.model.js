import { Schema, model } from "mongoose";

const dataSchema = new Schema(
  {
    type: {
      type: Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
    data: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Data = model("Data", dataSchema);
