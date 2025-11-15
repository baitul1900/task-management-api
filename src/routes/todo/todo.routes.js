import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createTodo } from "../../controllers/todo/todo.controller.js";



const router = Router();


router.use(verifyJWT)
router.route("/create").post(createTodo)

export default router;