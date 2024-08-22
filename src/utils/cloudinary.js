import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import { ApiError } from "./ApiError.js";
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath) => {
    try {
        // Check if the localFilePath is provided
        if (!localFilePath) {
            console.log("Local File Path Not Provided");
            return null;
        }

        // Log the file path being processed
        console.log("Processing file:", localFilePath);
        
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            timeout: 60000
        });

        // Log the successful upload
        console.log("File uploaded to Cloudinary:", response.url);

        // Removing the file from public/temp after a successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        // Log the error details
        console.error("Upload to Cloudinary failed:", error);

        // Ensuring the file is removed from pubic/temp even if the upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

const deleteFromCloduinary = async (publicId, resourceType) => {
    try {
        await cloudinary.uploader.destroy(
            publicId,
            { type: 'upload', resource_type: resourceType })
    } catch (error) {
        throw new ApiError(500, error.message || "Error occurred while deleting the resource from the server");
    }
}



export {
    uploadOnCloudinary,
    deleteFromCloduinary
}