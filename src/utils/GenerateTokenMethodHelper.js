import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";
import { HttpStatus } from "./httpStatusCodes.js";

const generateAcesssAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
       await user.save({ validateBeforeSave: false });

       
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
};

export default generateAcesssAndRefreshToken;