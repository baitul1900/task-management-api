import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.modal.js";
import { HttpStatus } from "../utils/httpStatusCodes.js";
import asyncHandler from "../utils/asynchandler.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN)
        // console.log(decodedToken);
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, error?.message || "Invalid access token")
    }
});


