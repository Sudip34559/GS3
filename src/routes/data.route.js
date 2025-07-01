import { Router } from "express";
import { addtData } from "../controllers/data.controller.js";

const router = Router();

router.route("/add").post(addtData);

export default router;
