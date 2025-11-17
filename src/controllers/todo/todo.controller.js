import todoService from "../../services/todo.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asynchandler.js";
import { HttpStatus } from "../../utils/httpStatusCodes.js";
import { createTodoValidation } from "../../validations/todo.validator.js";
import { errors as vineErrors } from '@vinejs/vine';


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

/**
 * Get todos for the authenticated user with optional filtering
 *
 * @route   GET /api/v1/todos/list
 * @access  Private (requires authentication)
 * @query   { completed?: 'true' | 'false', priority?: 'low' | 'medium' | 'high' } - Filter by completion status and/or priority
 *
 * @example
 * GET /api/v1/todos/list
 * Headers: { Authorization: "Bearer <token>" }
 *
 * GET /api/v1/todos/list?completed=true
 * Headers: { Authorization: "Bearer <token>" }
 *
 * GET /api/v1/todos/list?priority=high
 * Headers: { Authorization: "Bearer <token>" }
 *
 * GET /api/v1/todos/list?completed=false&priority=medium
 * Headers: { Authorization: "Bearer <token>" }
 *
 * @returns {200} Todos retrieved successfully
 * @returns {401} Unauthorized - Missing or invalid token
 * @returns {404} No todos found for the user
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


const getTodo = asyncHandler( async ( req, res ) => {
    const { completed, priority } = req.query;
    const filter = {};

    if (completed !== undefined) {
        filter.completed = completed === 'true';
    }

    if (priority !== undefined) {
        filter.priority = priority;
    }

    const todos = await todoService.getAllTodos(req.user._id, filter);
     if(!todos) {
        throw new ApiError(
            HttpStatus.NOT_FOUND,
            "No todos found for the user"
        );
     }

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            "Todos retrieved successfully",
            todos
        )
    )
});

export {createTodo, getTodo}