import { Router } from "express";
import {
    createReport,
    getReportById,
    getOpenReports,
    getReportsByUser,
    deleteReportById
} from "../controllers/report.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-report").post(upload.fields([
    {
        name: "imageUrl",
        maxCount: 1
    },
]), createReport);
router.route("/get-report").get(getReportById);
router.route("/get-open-report").get(getOpenReports);
router.route("/get-report-by-user").get(getReportsByUser);
router.route("/delete-report").delete(deleteReportById);

export default router;