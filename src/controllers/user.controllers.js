import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloduinary
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { getPublicId } from "../utils/getPublicId.js";


const generateAccessAndRefreshTokens = async (userId) => {

    try {

        const user = await User.findById(userId);//Finding the user
        const accessToken = user.generateAccessToken();//generating the access token
        const refreshToken = user.generateRefreshToken();//generating the refresh token

        user.refreshToken = refreshToken; //Setting the refresh token field of the user model and giving it the value of generated refresh token
        await user.save({ validateBeforeSave: false });//Saving the refresh token field value to the value assigned in the database

        return { accessToken, refreshToken };//returning the access and refresh token 

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // console.log(req.body);

    const { name, contact, email, gender, password } = req.body

    if ([name, contact, email, gender, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Fields cann't be left empty");
    }

    //Checking in the database whether or not user already exists based on username and email entered by the user
    const emailExists = await User.findOne({
        $or: [{ email }]
    });

    if (emailExists) {
        throw new ApiError(409, "Email already exits!");
    }

    // console.log(req.file);

    //Now getting the local path of the images uploaded by the user
    const avatarLocalPath = req.files?.avatar[0]?.path; //This req.files comes from the multer middleware function


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file required multer");
    }

    //Uploading the images from local storage to on cloudinary server
    // console.log(avatarLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log(avatar);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required cloudinary");
    }

    //pushing all the data entered by the user into the database
    const user = await User.create({
        name,
        avatar: avatar.url,
        email,
        contact,
        gender,
        password,
    });

    //Removing the password and refreshToken fields form the user after it is being created
    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!isUserCreated) {
        throw new ApiError(500, "Something went wrong while registering the user!");
    }

    //Sending a response 
    res.status(201).json(
        new ApiResponse(
            201,
            isUserCreated,
            "User registered successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "email is required");
    }

    const user = await User.findOne({
        $or: [{ email }]
    });

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "User doesn't exist");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

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
                    user: loggedUser, accessToken, refreshToken
                },
                "user logged in successfully"
            )
        )
});

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
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
                "User loggedOut"))

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

        const user = await User.findById(decodedToken?._id);
        
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
        console.log(user);
        
        const currentUserRefreshToken = user.refreshToken;
        console.log("Refresh Token from db ",currentUserRefreshToken);

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh Token expired");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

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

    const user = await User.findById(req.user?._id);

    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Incorrect Password! Please Enter correct password!");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(401, "New password cannot be same as old password");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(401, "Passwords does not match!");
    }



    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

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

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User fetched successfully"
            )
        )
});

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { name, email, contact } = req.body;

    if (!name || !email || !contact) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name,
                email,
                contact
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
                user,
                "Account details updated successfully"
            )
        )
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const tempUser = await User.findById(req.user?._id);
    const publicIdAvatar = getPublicId(tempUser.avatar);
    await deleteFromCloduinary(publicIdAvatar, 'image');

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
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
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
};