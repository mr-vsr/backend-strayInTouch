import mongoose from 'mongoose';
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const healthCheck = async (req, res, next) => {
    try {

        const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

        const response = new ApiResponse(200, {
            message: "Backend is up and running",
            dbStatus: dbStatus,
            timestamp: new Date(),
        });
        res.status(response.statusCode).json(response);
    } catch (error) {
        const apiError = new ApiError(500, "Error occurred while checking server health", [], error.message);
        next(apiError);
    }
};
