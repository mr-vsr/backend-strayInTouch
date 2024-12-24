import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {Aiding} from '../models/aiding.model.js'; 
import {Ngo} from '../models/ngo.model.js';
// import { Report } from "../models/report.model.js";
// import User from '../models/User';

// Controller to add a new aiding entry
const addAiding = asyncHandler(async (req, res) => {
    try {
        const { user, ngo, description, status } = req.body;

        // Ensure user and NGO exist
        // const foundUser = await User.findById(user);
        // if (!foundUser) {
        //     return res.status(400).json({ message: 'User not found' });
        // }

        const foundNgo = await Ngo.findById(ngo);
        if (!foundNgo) {
            return res.status(400).json({ message: 'NGO not found' });
        }

        const aid = await Aiding.create({
            user,
            ngo,
            description,
            status: status || 'pending',
        });

        const isAidCreated = await Aiding.findById(aid._id);

        if (!isAidCreated) {
            throw new ApiError(500, "Something went wrong while creating aid!");
        }

        res.status(201).json(
            new ApiResponse(
                201,
                isAidCreated,
                "Aid successfully"
            )
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
});

export { addAiding };
