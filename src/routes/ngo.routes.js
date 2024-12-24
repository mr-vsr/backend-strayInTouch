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
import { verifyJWT } from "../middlewares/auth.ngo.middleware.js";

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
router.route("/logout").post(verifyJWT, logoutNgo);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-ngo").get(verifyJWT, getCurrentNgo);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/banner").patch(verifyJWT, upload.single("ngoBanner"), updateNgoBanner);

export default router;