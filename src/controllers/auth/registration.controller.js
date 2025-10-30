import { RESERVED_USERNAMES } from "../../constants.js";
import { User } from "../../models/user.modal.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { issueRegistrationOtp } from "../../utils/helpers.js";
import { HttpStatus } from "../../utils/httpStatusCodes.js";
import { userRegistrationValidation } from "../../validations/user.validation.js";
import { errors as vineErrors } from '@vinejs/vine';

const userRegistration = async ( req, res) => {
    let validateData;
    try {
        validateData = await userRegistrationValidation.validate(req.body)
    } catch (error) {
        if (error instanceof vineErrors.E_VALIDATION_ERROR) {
            throw new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, "Validation failed", error.messages);
        }
        throw error;
    }
    
    const { userName, fullName, email, password, gender } = req.body;

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

    const otp = await issueRegistrationOtp(validateData.email);

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

export {userRegistration};