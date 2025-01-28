import { Router } from "express";
import {
    createReport,
    getReportById,
    getOpenReports,
    getResolvedReports,
    getInprogressReports,
    getHighPriorityReports,
    getLowPriorityReports,
    getMediumPriorityReports,
    getReportsByUser,
} from "../controllers/report.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyNgoJWT } from "../middlewares/auth.ngo.middleware.js";

const router = Router();

router.route("/create-report").post(upload.fields([
    {
        name: "imageUrl",
        maxCount: 1
    },
]), createReport);
router.route("/get-report").get(verifyNgoJWT, getReportById);
router.route("/get-low-priority-report").get(verifyNgoJWT, getLowPriorityReports);
router.route("/get-high-priority-report").get(verifyNgoJWT, getHighPriorityReports);
router.route("/get-medium-priority-report").get(verifyNgoJWT, getMediumPriorityReports);
router.route("/get-open-report").get(verifyNgoJWT, getOpenReports);
router.route("/get-resolved-report").get(verifyJWT, getResolvedReports);
router.route("/get-inprogress-report").get(verifyJWT, getInprogressReports);
router.route("/get-report-by-user").get(verifyJWT, getReportsByUser);



export default router;