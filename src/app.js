import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: "*",
    // origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import aiRoute from "./routes/ai.route.js";
import typeRoute from "./routes/type.route.js";
import dataRoute from "./routes/data.route.js";

app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/type", typeRoute);
app.use("/api/v1/data", dataRoute);

export { app };
