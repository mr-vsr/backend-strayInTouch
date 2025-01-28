import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, contact, gender, userType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ApiError(400, "User with this email already exists"));
    }

    const newUser = new User({
        name,
        email,
        password,
        contact,
        gender,
        userType
    });

    await newUser.save();

    const accessToken = newUser.generateAccessToken();
    const refreshToken = newUser.generateRefreshToken();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });

    return res.status(201).json(
        new ApiResponse(201, {
            message: "Signup successful",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                userType: newUser.userType,
            }
        })
    );
});

const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordCorrect(password))) {
        return next(new ApiError(401, "Invalid credentials"));
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });

    return res.status(200).json(
        new ApiResponse(200, {
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        })
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(200).json(
            new ApiResponse(200, { message: "Logout successful" })
        );
    } catch (err) {
        return next(new ApiError(500, "Error occurred during logout", [], err.stack));
    }
});

export {
    registerUser,
    loginUser,
    logoutUser
};
