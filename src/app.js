import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
const app = express();
app.use(cookieParser());

app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use('/employee_images', express.static('public/employee_images'));
app.use('/case_study_images', express.static('public/case_study_images'));



app.use(express.static("public"));


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
import caseStudyRoutes from './routes/caseStudy.route.js'
import serviceRoutes from './routes/service.route.js'
import employeeRoutes from './routes/employee.route.js'

app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/type", typeRoute);
app.use("/api/v1/data", dataRoute);
app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/employees', employeeRoutes);
app.use("/api/v1/team", teamRoute);
app.use("/api/v1/testimonials", testimonialRoute);
app.use("/api/v1/work", workRoute);
app.use('/api/v1/workExample', workExampleRoute);
app.use("/api/v1/about", aboutRoutes);
app.use('/api/v1/contact', contactRoute);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/case-studies", caseStudyRoutes);
export { app };
