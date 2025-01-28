import { User } from "../models/user.model.js";
import { Ngo } from "../models/ngo.model.js";
import { Report } from "../models/report.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({ role: 'user' });
    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

const getAllAdmins = asyncHandler(async (req, res, next) => {
    const users = await User.find({ role: 'admin' });
    return res.status(200).json(new ApiResponse(200, users, "Admin fetched successfully"));
});

const getAllNGOs = asyncHandler(async (req, res, next) => {
    const ngos = await Ngo.find();
    return res.status(200).json(new ApiResponse(200, ngos, "NGOs fetched successfully"));
});

const getAllReports = asyncHandler(async (req, res, next) => {
    const reports = await Report.find().populate('user aiding');
    return res.status(200).json(new ApiResponse(200, reports, "Reports fetched successfully"));
});

const deleteNgoById = asyncHandler(async (req, res) => {
    const { ngoId } = req.body;

    const ngo = await Ngo.findById(ngoId);

    if (!ngo) {
        throw new ApiError(404, "Ngo not found");
    }

    await ngo.deleteOne();

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Ngo deleted successfully"
        )
    );
});

const deleteUserById = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await user.deleteOne();

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "User deleted successfully"
        )
    );
});

const deleteReportById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body;
        const report = await Report.findByIdAndDelete(id);

        if (!report) {
            throw new ApiError(404, "Report not found");
        }

        res.status(200).json({
            success: true,
            message: "Report deleted successfully",
        });

    } catch (error) {
        const apiError = error instanceof ApiError ? error : new ApiError(500, error.message);
        res.status(apiError.statusCode).json(apiError);
    }
});

    export {
    getAllUsers,
    getAllAdmins,
    getAllNGOs,
    getAllReports,
    deleteReportById,
    deleteUserById,
    deleteNgoById,
};
