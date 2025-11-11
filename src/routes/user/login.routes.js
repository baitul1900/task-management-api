import { Router } from "express";
import { userLoginValidation } from "../../validations/user.validation.js";
import { userLogin, userLogout, refreshAccessToken } from "../../controllers/auth/login.controller.js";
import { validate } from "../../middlewares/validation.schema.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";


const router = Router();


// Login route - public
router.route("/login").post(validate(userLoginValidation), userLogin);

// Logout route - protected (requires authentication)

// Refresh token route - public (but requires valid refresh token)
router.route("/refresh-token").post(refreshAccessToken);


// protected routes
router.use(verifyJWT)
router.route("/logout").post( userLogout);


export default router;