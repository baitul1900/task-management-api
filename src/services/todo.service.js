import { Todo } from "../models/todo.model.js"
import { ApiError } from "../utils/ApiError.js";
import { HttpStatus } from "../utils/httpStatusCodes.js";




class TodoService {

 /**
     * Create a new todo for a user
     * 
     * @param {Object} todoData - The validated todo data from request body
     * @param {String} todoData.title - Title of the todo (required)
     * @param {String} todoData.description - Description (optional)
     * @param {Date} todoData.dueDate - Due date (optional)
     * @param {String} todoData.priority - Priority level: low/medium/high (optional)
     * @param {String} userId - The ID of the user creating the todo (from req.user._id)
     * 
     * @returns {Promise<Object>} The created todo document
     * @throws {ApiError} If todo creation fails
     * 
     * @example
     * const todo = await todoService.createTodo({
     *   title: "Buy groceries",
     *   description: "Milk, eggs, bread",
     *   dueDate: "2024-12-31",
     *   priority: "high"
     * }, userId);
     */


  async createTodo( todoData, userId) {
    try {
        const { title, description, dueDate, priority } = todoData

        const todo = await Todo.create({
            title,
             description: description || null,
             dueDate : dueDate || null,
              priority: priority || "medium",
              owner : userId,
              completed : false,
               completedAt: null
        })

           if (!todo) {
                throw new ApiError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to create todo. Please try again."
                );
            }

             return todo;
    } catch (error) {
        if (error instanceof ApiError) {
                throw error;
            }

             if (error.name === 'ValidationError') {
                throw new ApiError(
                    HttpStatus.BAD_REQUEST,
                    "Invalid todo data",
                    error.message
                );
            }

             throw new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An error occurred while creating the todo",
                error.message
            );
    }
  }
};


export default new TodoService();