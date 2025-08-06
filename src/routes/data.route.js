import { Router } from "express";
import { addData, deleteData, getAllData, updateData } from "../controllers/data.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();
router.use(authMiddleware, isAdmin);

router.route("/add").post(addData);
router.route("/").get(getAllData);
router.route("/update/:id").put(updateData);
router.route("/delete/:id").delete(deleteData)

export default router;
