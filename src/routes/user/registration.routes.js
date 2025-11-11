import { Router } from "express";
import { userRegistrationValidation } from "../../validations/user.validation.js";
import { userRegistration, verifyRegistrationOtp } from "../../controllers/auth/registration.controller.js";
import { validate } from "../../middlewares/validation.schema.js";


const router = Router();


// router here
router.route("/register").post(validate(userRegistrationValidation), userRegistration);
router.route("/verify-otp").post(verifyRegistrationOtp);


export default router;