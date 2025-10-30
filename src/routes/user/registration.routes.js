import { Router } from "express";
import { userRegistrationValidation } from "../../validations/user.validation.js";
import { userRegistration } from "../../controllers/auth/registration.controller.js";
import { validate } from "../../middlewares/validation.schema.js";


const router = Router();


// router here
router.route("/register").post(validate(userRegistrationValidation), userRegistration);


export default router;