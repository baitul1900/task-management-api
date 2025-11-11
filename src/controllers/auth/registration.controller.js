import { RESERVED_USERNAMES } from "../../constants.js";
import { User } from "../../models/user.modal.js";
import { VerificationOtp } from "../../models/verification.modal.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asynchandler.js";
import { compareOtp, issueRegistrationOtp } from "../../utils/helpers.js";
import { HttpStatus } from "../../utils/httpStatusCodes.js";
import { userRegistrationValidation } from "../../validations/user.validation.js";
import { errors as vineErrors } from '@vinejs/vine';

const userRegistration = async ( req, res) => {
    const { userName, fullName, email, password, gender } = req.body;
    let validateData;
    try {
        validateData = await userRegistrationValidation.validate(req.body)
    } catch (error) {
        if (error instanceof vineErrors.E_VALIDATION_ERROR) {
            throw new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, "Validation failed", error.messages);
        }
        throw error;
    }
    

   if (RESERVED_USERNAMES.includes(validateData.userName)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Username is reserved, please choose another one");
   };

   const isUserExist = await User.findOne({ $or: [ { userName: validateData.userName }, { email: validateData.email } ] });

   if(isUserExist) {
        throw new ApiError(HttpStatus.CONFLICT, "Username or Email already in use");
   };

    const newUser = new User({
        userName: validateData.userName,
        fullName: validateData.fullName,
        email: validateData.email,
        password: validateData.password,
        gender: validateData.gender
    });

    await newUser.save();
    const otp = await issueRegistrationOtp(validateData.email );
    if(!otp) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to issue OTP");
    }

    const withOutCredintials = await User.findById(newUser._id).select("-password",).select("-refreshToken");

    if(!withOutCredintials) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "User creation failed");
    };


    return res.status(HttpStatus.CREATED).json(
        new ApiResponse(
            HttpStatus.CREATED,
            `User registered successfully. OTP sent to ${validateData.email} ${otp}` ,
            withOutCredintials
        )
    );
};



// VERIFY OTP CONTROLLER
const verifyRegistrationOtp = async ( req, res) => {
    const { email, otp } = req.body;
    if(!email || !otp) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Email and OTP are required");
    }

    const user = await User.findOne({email});
    if(!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }

    const currentDate = new Date();

    const verificationRecord = await VerificationOtp.findOne({
        userId : user._id,
        userEmail : email,
        purpose : "register",
        consumedAt : null,
        expiresAt : { $gt : currentDate }
    });

    if(!verificationRecord) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "No valid OTP found or OTP has expired");
    }

    if(verificationRecord.attempts >= verificationRecord.maxAttempts) {
        verificationRecord.consumedAt = new Date();
        await verificationRecord.save();
        throw new ApiError(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts");
    };

    const isOtpValid = await compareOtp(otp, verificationRecord.codeHash);
      console.log(isOtpValid);
      verificationRecord.attempts += 1;
     
    if(!isOtpValid) {
        await verificationRecord.save();
        throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid OTP"); 
    }  

    verificationRecord.consumedAt = new Date();
    await verificationRecord.save();

    await User.updateOne(
        { email : user.email },
        { $set : { emailVerifiedAt : new Date() } }
    );

     return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "OTP verified successfully" )
    );      
}


// resend otp controller 
const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Email is required");
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }

    // Check if already verified
    if (user.emailVerifiedAt) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Email already verified");
    }

    const currentDate = new Date();

    // Find active OTP record
    const existingOtp = await VerificationOtp.findOne({
        userId: user._id,
        userEmail: email,
        purpose: "register",
        consumedAt: null,
        expiresAt: { $gt: currentDate }
    });

    // Check resend limit (e.g., max 3 resends)
    const MAX_RESEND_COUNT = 3;
    if (existingOtp && existingOtp.resentCount >= MAX_RESEND_COUNT) {
        throw new ApiError(
            HttpStatus.TOO_MANY_REQUESTS, 
            "Maximum resend limit reached. Please try again later"
        );
    }

    // Optional: Implement cooldown (e.g., 60 seconds between resends)
    if (existingOtp) {
        const COOLDOWN_SECONDS = 60;
        const timeSinceLastSent = (currentDate - existingOtp.updatedAt) / 1000;
        
        if (timeSinceLastSent < COOLDOWN_SECONDS) {
            const remainingTime = Math.ceil(COOLDOWN_SECONDS - timeSinceLastSent);
            throw new ApiError(
                HttpStatus.TOO_MANY_REQUESTS,
                `Please wait ${remainingTime} seconds before requesting another OTP`
            );
        }

        // Increment resend count and mark as consumed
        existingOtp.consumedAt = currentDate;
        existingOtp.resentCount += 1;
        await existingOtp.save();
    }

    // Issue new OTP (inherits resentCount from previous)
    const newResentCount = existingOtp ? existingOtp.resentCount : 0;
    const otp = await issueRegistrationOtp(email, newResentCount);
    
    if (!otp) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to resend OTP");
    }

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            `OTP resent successfully to ${email}`,
            { 
                resentCount: newResentCount,
                remainingResends: MAX_RESEND_COUNT - newResentCount 
            }
        )
    );
});

export {userRegistration, verifyRegistrationOtp, resendOtp};