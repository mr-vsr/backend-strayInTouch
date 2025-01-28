import { Router } from "express";

import {
    registerNgo,
    loginNgo,
    logoutNgo,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentNgo,
    updateAccountDetails,
    updateNgoBanner,
} from "../controllers/ngo.controllers.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyNgoJWT } from "../middlewares/auth.ngo.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "ngoBanner",
            maxCount: 1
        },
    ]),
    registerNgo
)
router.route("/login").post(loginNgo);
router.route("/logout").post(verifyNgoJWT, logoutNgo);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyNgoJWT, changeCurrentPassword);
router.route("/current-ngo").get(verifyNgoJWT, getCurrentNgo);
router.route("/update-account").patch(verifyNgoJWT, updateAccountDetails);
router.route("/banner").patch(verifyNgoJWT, upload.single("ngoBanner"), updateNgoBanner);

export default router;