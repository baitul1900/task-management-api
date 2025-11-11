import bcrypt from 'bcrypt';
import { User } from '../models/user.modal.js';
import { ApiError } from './ApiError.js';
import { HttpStatus } from './httpStatusCodes.js';
import { OTP_EXPIRY_TIME } from '../constants.js';
import { VerificationOtp } from '../models/verification.modal.js';



// generate Otp
export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export const hashOtp = (otp) => bcrypt.hash(otp, 10);
export const compareOtp = (otp, hash) => bcrypt.compare(otp, hash);

// nodemailer options leter will be define 

export const sendOtpEmail = async ({to, otp}) => {
    console.log(`Sending OTP ${otp} to ${to}`);   

}

// -------------------------------
// issue registration OTP 
export const issueRegistrationOtp = async (userEmail,  resentCount) => {
   const user = await User.findOne({email: userEmail});
   if(!user) {
       throw new ApiError(HttpStatus.NOT_FOUND, "User email not found")
   };

   if(user.emailVerifiedAt) return;

    const otp = generateOtp();
    const codeHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_TIME); // 10 minutes from now


    await VerificationOtp.create({
        userId : user._id,
        userEmail,
        purpose : "register",
        resentCount: resentCount,
        codeHash,
        expiresAt,
        attempts : 0,
        maxAttempts: 3
    });

    await sendOtpEmail({to: userEmail, otp});

    return otp;
};