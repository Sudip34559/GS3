import { Router } from "express";
import { addtype, getAllTypes, deleteType, updateType } from "../controllers/type.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js"
import isAdmin from "../middlewares/isAdmin.js"

const router = Router();

router.use(authMiddleware,isAdmin);

router.route("/add").post(addtype);
router.route("/").get(getAllTypes);
router.route("/update/:id").put(updateType);
router.route("/delete/:id").delete(deleteType);
export default router;
