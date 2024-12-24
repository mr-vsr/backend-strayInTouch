import { Router } from "express";
import { addAiding } from "../controllers/aiding.controller.js";

const router = Router();

router.route("/").post(addAiding);

export default router;