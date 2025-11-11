import { User } from "../../models/user.modal.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asynchandler.js";
import { HttpStatus } from "../../utils/httpStatusCodes.js";
import { userLoginValidation } from "../../validations/user.validation.js";
import { errors as vineErrors } from '@vinejs/vine';
import generateAcesssAndRefreshToken from "../../utils/GenerateTokenMethodHelper.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../helper/cookies.options.js";

const userLogin = asyncHandler(async (req, res) => {
    let validateData;
    try {
        validateData = await userLoginValidation.validate(req.body);
    } catch (error) {
        if (error instanceof vineErrors.E_VALIDATION_ERROR) {
            throw new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, "Validation failed", error.messages);
        }
        throw error;
    }

    const { identifier, password } = validateData;

    // Find user by email or username
    const user = await User.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { userName: identifier.toLowerCase() }
        ]
    });

    if (!user) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    // Check if user is verified
    if (!user.emailVerifiedAt) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Please verify your email before logging in");
    }

    // Check if user is active
    if (!user.isActive) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Account is deactivated");
    }

    // Check password
    const isPasswordValid = await user.isPasswordMatched(password);
    if (!isPasswordValid) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAcesssAndRefreshToken(user._id);

    // Get user without sensitive data
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Set cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            "Login successful",
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            }
        )
    );
});

const userLogout = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Clear refresh token from database
    await User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    // Clear cookies
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", refreshTokenCookieOptions);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Logout successful")
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Refresh token is required");
    }

    try {
        // Find user with this refresh token
        const user = await User.findOne({ refreshToken: incomingRefreshToken });

        if (!user) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateAcesssAndRefreshToken(user._id);

        // Get user without sensitive data
        const refreshedUser = await User.findById(user._id).select("-password -refreshToken");

        // Set new cookies
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Token refreshed successfully",
                {
                    user: refreshedUser,
                    accessToken,
                    refreshToken: newRefreshToken
                }
            )
        );
    } catch (error) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
    }
});

export { userLogin, userLogout, refreshAccessToken };