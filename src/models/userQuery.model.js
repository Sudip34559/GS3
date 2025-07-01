import { Schema, model } from "mongoose";

const userQuerySchema = new Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserQuery = model("UserQuery", userQuerySchema);
