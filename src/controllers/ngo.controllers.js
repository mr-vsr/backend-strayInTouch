import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Ngo } from "../models/ngo.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloduinary
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { getPublicId } from "../utils/getPublicId.js";



const generateAccessAndRefreshTokens = async (ngoId) => {
    try {

        const ngo = await Ngo.findById(ngoId);//Finding the user
        const accessToken = ngo.generateAccessToken();//generating the access token
        const refreshToken = ngo.generateRefreshToken();//generating the refresh token

        ngo.refreshToken = refreshToken; //Setting the refresh token field of the user model and giving it the value of generated refresh token
        await ngo.save({ validateBeforeSave: false });//Saving the refresh token field value to the value assigned in the database

        return { accessToken, refreshToken };//returning the access and refresh token 

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerNgo = asyncHandler(async (req, res) => {

    const { name,address, contact, email, websiteLink, bannerUrl,password } = req.body

    if ([name, address, contact, email, websiteLink, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Fields can not be left empty");
    }

    //Checking in the database whether or not ngo already exists based on name and email entered by the ngo user
    const emailExists = await Ngo.findOne({
        $or: [{ email }]
    });

    if (emailExists) {
        throw new ApiError(409, "Email already exits!");
    }

    // console.log(req.file);

    //Now getting the local path of the images uploaded by the user
    const ngoBannerLocalPath = req.files?.ngoBanner[0]?.path; //This req.files comes from the multer middleware function


    if (!ngoBannerLocalPath) {
        throw new ApiError(400, "Avatar file required multer");
    }

    //Uploading the images from local storage to on cloudinary server
    console.log(ngoBannerLocalPath);

    const ngoBanner = await uploadOnCloudinary(ngoBannerLocalPath);
    // console.log(ngoBanner);


    if (!ngoBanner) {
        throw new ApiError(400, "Avatar file is required cloudinary");
    }

    //pushing all the data entered by the user into the database
    const ngo = await Ngo.create({
        name,
        address,
        contact,
        email,
        websiteLink,
        ngoBanner:ngoBanner.url,
        password,
    });

    //Removing the password and refreshToken fields form the user after it is being created
    const isNgoCreated = await Ngo.findById(ngo._id).select(
        "-password -refreshToken"
    );

    if (!isNgoCreated) {
        throw new ApiError(500, "Something went wrong while registering the user!");
    }

    //Sending a response 
    res.status(201).json(
        new ApiResponse(
            201,
            isNgoCreated,
            "Ngo registered successfully"
        )
    );
});

const loginNgo = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "email is required");
    }

    const ngo = await Ngo.findOne({
        $or: [{ email }]
    });

    const isPasswordValid = await ngo.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Ngo doesn't exist");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(ngo._id);

    const loggedNgo = await Ngo.findById(ngo._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    ngo: loggedNgo, accessToken, refreshToken
                },
                "ngo logged in successfully"
            )
        )
});

const logoutNgo = asyncHandler(async (req, res) => {

    await Ngo.findByIdAndUpdate(
        req.ngo._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "Ngo loggedOut"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
    }

    // console.log("Refresh Token from body ",incomingRefreshToken);
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const ngo = await Ngo.findById(decodedToken?._id);

        if (!ngo) {
            throw new ApiError(401, "Invalid refresh token");
        }
        console.log(ngo);

        const currentNgoRefreshToken = ngo.refreshToken;
        console.log("Refresh Token from db ", currentNgoRefreshToken);

        if (incomingRefreshToken !== ngo.refreshToken) {
            throw new ApiError(401, "Refresh Token expired");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(ngo._id);

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Invalid refresh Token"
        )
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword, confirmPassword } = req.body;

    const ngo = await Ngo.findById(req.ngo?._id);

    const isOldPasswordCorrect = await ngo.isPasswordCorrect(oldPassword);

    if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Incorrect Password! Please Enter correct password!");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(401, "New password cannot be same as old password");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(401, "Passwords does not match!");
    }



    ngo.password = newPassword;

    await ngo.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully"
            )
        )

});

const getCurrentNgo = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.ngo,
                "Ngo fetched successfully"
            )
        )
});

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { name, email, contact, address } = req.body;

    if (!name || !email || !contact || !address) {
        throw new ApiError(400, "All fields are required");
    }

    const ngo = await Ngo.findByIdAndUpdate(
        req.ngo?._id,
        {
            $set: {
                name,
                email,
                contact,
                address
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                ngo,
                "Account details updated successfully"
            )
        )
})

const updateNgoBanner = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const ngoBanner = await uploadOnCloudinary(ngoBannerLocalPath)

    if (!ngoBanner.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const tempNgo = await Ngo.findById(req.ngo?._id);
    const publicIdNgoBanner = getPublicId(tempNgo.ngoBanner);
    await deleteFromCloduinary(publicIdAvatar, 'image');

    const ngo = await Ngo.findByIdAndUpdate(
        req.ngo?._id,
        {
            $set: {
                ngoBanner: ngoBanner.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        )
});

export {
    registerNgo,
    loginNgo,
    logoutNgo,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentNgo,
    updateAccountDetails,
    updateNgoBanner,
};