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
import authRoutes from "./routes/auth.route.js"
import teamRoute from './routes/team.route.js'
import testimonialRoute from './routes/testimonial.route.js'
import workRoute from './routes/work.route.js'
import workExampleRoute from './routes/workExample.route.js'
import aboutRoutes from './routes/about.route.js'
import contactRoute from './routes/contact.route.js'

app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/type", typeRoute);
app.use("/api/v1/data", dataRoute);
app.use('/api/v1/auth', authRoutes); //to test type in hit in postman localhost:8000/api/v1/auth/register
//to test type in hit in postman localhost:8000/api/v1/auth/login(for login)
//to test type in hit in postman localhost:8000/api/v1/auth/logout(for logout)
app.use("/api/v1/team",teamRoute);
app.use("/api/v1/testimonials",testimonialRoute);
app.use("/api/v1/work",workRoute);
app.use('/api/v1/workExample',workExampleRoute);
app.use("/api/v1/about",aboutRoutes);
app.use('/api/v1/contact',contactRoute);
export { app };
