import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createTodo, getTodo } from "../../controllers/todo/todo.controller.js";



const router = Router();


router.use(verifyJWT)
router.route("/create").post(createTodo)
router.route("/list").get(getTodo)

export default router;