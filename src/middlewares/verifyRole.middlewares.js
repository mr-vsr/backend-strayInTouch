import { ApiError } from "../utils/ApiError.js";

// Middleware to check user role (admin or other allowed roles)
const verifyAdminRole = (admin) => {
    return (req, res, next) => {

        const { role } = req.user;

        // Check if the user's role is in the allowed roles array
        if (role !== admin) {
            return next(new ApiError(403, "Access denied: Insufficient permissions"));
        }
        next();
    };
};

export { verifyAdminRole };
