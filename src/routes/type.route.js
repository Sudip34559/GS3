import { Router } from "express";
import { addtype } from "../controllers/type.controller.js";

const router = Router();

router.route("/add").post(addtype);
export default router;
