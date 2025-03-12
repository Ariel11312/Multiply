import { GoldenSeatOwner } from "../models/golden-seat-owner.js";
import { goldenseats } from "../models/golden-seats.js";
import jwt from "jsonwebtoken";

export const getAllGoldenSeaters = async (request, response) => {
    try {
        const members = await goldenseats.find();
        response.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        console.error(`Error fetching members: ${error.message}`);
        response.status(500).json({
            success: false,
            message: "An error occurred while fetching members"
        });
    }
};
export const getGoldenSeatersById = async (request, response) => {
 const token = request.cookies.token;
    if (!token) {
        return response.status(401).json({
            success: false,
            message: 'Authentication token is missing.',
        });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    try {

        const members = await GoldenSeatOwner.find({ userId: decoded.userId });
    
        
        response.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        console.error(`Error fetching members: ${error.message}`);
        response.status(500).json({
            success: false,
            message: "An error occurred while fetching members"
        });
    }
};
