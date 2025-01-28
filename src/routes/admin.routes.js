import { Router } from 'express';
import {
    getAllUsers,
    getAllNGOs,
    getAllReports,
    getAllAdmins,
    deleteReportById,
    deleteNgoById,
    deleteUserById
} from '../controllers/admin.controllers.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminRole } from "../middlewares/verifyRole.middlewares.js";

const router = Router();


router.route("/get-all-users").get(verifyJWT, verifyAdminRole("admin") , getAllUsers);
router.route("/get-all-admins").get(verifyJWT, verifyAdminRole("admin") , getAllAdmins);
router.route("/get-all-ngos").get(verifyJWT, verifyAdminRole("admin"), getAllNGOs);
router.route("/get-all-reports").get(verifyJWT, verifyAdminRole("admin"), getAllReports);
router.route("/delete-report").delete(verifyJWT, verifyAdminRole("admin"), deleteReportById);
router.route("/delete-user").delete(verifyJWT, verifyAdminRole("admin"), deleteUserById);
router.route("/delete-ngo").delete(verifyJWT, verifyAdminRole("admin"), deleteNgoById);



export default router;
