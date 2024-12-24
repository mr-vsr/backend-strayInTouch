import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Report } from "../models/report.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    uploadOnCloudinary,
} from "../utils/cloudinary.js";




// Create a new report
const createReport = asyncHandler(async (req, res) => {

    try {
        const { user, description, coordinate, location, status, aiding, priority } = req.body;

        // Check if a single image is uploaded and process it
        const animalReportLocalPath = req.files?.imageUrl[0]?.path;

        if (!animalReportLocalPath) {
            throw new ApiError(400, "Image file is required multer");
        }

        // Upload the image to Cloudinary
        const animalIncident = await uploadOnCloudinary(animalReportLocalPath);
        // console.log(animalIncident);

        if (!animalIncident) {
            throw new ApiError(400, " animalIncident file is required cloudinary");
        }

        // Create the report with the uploaded image URL
        const report = await Report.create({
            user: user || null,
            description,
            coordinate,
            location,
            status,
            aiding,
            priority,
            imageUrl: animalIncident.url,
        });

        const isReportCreated = await Report.findById(report._id);

        if (!isReportCreated) {
            throw new ApiError(500, "Something went wrong while reporting!");
        }

        res.status(201).json(
            new ApiResponse(
                201,
                report,
                isReportCreated,
                "Incident reported successfully!"
            )
        );
    } catch (error) {
        console.error("Error details:", error);
        const apiError = new ApiError(500, error.message);
        res.status(apiError.statusCode).json(apiError);
    }
});

//Get a Report by Id
const getReportById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body;
        const report = await Report.findById(id).populate("user aiding");

        if (!report) {
            throw new ApiError(404, "Report not found");
        }

        res.status(200).json({
            success: true,
            message: "Report fetched successfully",
            data: report,
        });
    } catch (error) {
        const apiError = error instanceof ApiError ? error : new ApiError(500, error.message);
        res.status(apiError.statusCode).json(apiError);
    }
});

//Get all open reports
const getOpenReports = asyncHandler(async (req, res) => {
    try {
        const openReports = await Report.find({ status: 'open' }).populate("user aiding");

        if (openReports.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No open reports found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Open reports fetched successfully",
            data: openReports,
        });
    } catch (error) {
        const apiError = new ApiError(500, error.message);
        res.status(apiError.statusCode).json(apiError);
    }
});

//Get all the reports by a user
const getReportsByUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.body; // Extract userId from request parameters
        const userReports = await Report.find({ user: userId }).populate("aiding");

        if (userReports.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reports found for the specified user",
            });
        }

        res.status(200).json({
            success: true,
            message: "Reports fetched successfully",
            data: userReports,
        });
    } catch (error) {
        const apiError = new ApiError(500, error.message);
        res.status(apiError.statusCode).json(apiError);
    }
});


// Delete a report
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
    createReport,
    getReportById,
    getOpenReports,
    getReportsByUser,
    deleteReportById
}