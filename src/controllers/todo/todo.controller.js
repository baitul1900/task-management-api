import todoService from "../../services/todo.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asynchandler.js";
import { HttpStatus } from "../../utils/httpStatusCodes.js";
import { createTodoValidation } from "../../validations/todo.validator.js";



/**
 * Create a new todo
 * 
 * @route   POST /api/v1/todos
 * @access  Private (requires authentication)
 * @body    { title, description?, dueDate?, priority? }
 * 
 * @example
 * POST /api/v1/todos
 * Headers: { Authorization: "Bearer <token>" }
 * Body: {
 *   "title": "Buy groceries",
 *   "description": "Milk, eggs, bread",
 *   "dueDate": "2024-12-31",
 *   "priority": "high"
 * }
 * 
 * @returns {201} Todo created successfully with todo data
 * @returns {401} Unauthorized - Missing or invalid token
 * @returns {422} Validation failed - Invalid input data
 * @returns {500} Internal server error
 */


const createTodo = asyncHandler( async ( req, res ) => {
    let validateData;

    try {
        validateData = await createTodoValidation.validate(req.body);
    } catch (error) {
        if (error instanceof vineErrors.E_VALIDATION_ERROR) {
            throw new ApiError(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Validation failed",
                error.messages
            );
        }

        throw error;
    }


    const todo = await todoService.createTodo(validateData, req.user._id);

    return res.status(HttpStatus.CREATED).json(
        new ApiResponse(
            HttpStatus.CREATED,
            "Todo created successfully",
            todo
        )
    );
});

export {createTodo}