// validators/todo.validator.js
import vine from '@vinejs/vine';

/**
 * Validator for creating a new todo
 * Used in: POST /api/v1/todos
 */
export const createTodoValidation = vine.compile(
  vine.object({
    title: vine
      .string()
      .trim()
      .minLength(1, 'Title is required')
      .maxLength(200, 'Title cannot exceed 200 characters'),
    
    description: vine
      .string()
      .trim()
      .maxLength(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    
    dueDate: vine
      .date({
        formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'ISO8601']
      })
      .optional(),
    
    priority: vine
      .enum(['low', 'medium', 'high'])
      .optional()
  })
);

/**
 * Validator for updating a todo
 * Used in: PATCH /api/v1/todos/:id
 * Note: All fields are optional, but at least one must be provided
 */
export const updateTodoValidation = vine.compile(
  vine.object({
    title: vine
      .string()
      .trim()
      .minLength(1, 'Title cannot be empty')
      .maxLength(200, 'Title cannot exceed 200 characters')
      .optional(),
    
    description: vine
      .string()
      .trim()
      .maxLength(1000, 'Description cannot exceed 1000 characters')
      .optional()
      .nullable(), // Allow null to clear description
    
    dueDate: vine
      .date({
        formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'ISO8601']
      })
      .optional()
      .nullable(), // Allow null to clear due date
    
    completed: vine
      .boolean()
      .optional(),
    
    priority: vine
      .enum(['low', 'medium', 'high'])
      .optional()
  })
);

/**
 * Validator for query parameters (filtering, pagination, sorting)
 * Used in: GET /api/v1/todos
 */
export const todoQueryValidation = vine.compile(
  vine.object({
    // Filtering
    completed: vine
      .boolean()
      .optional(),
    
    priority: vine
      .enum(['low', 'medium', 'high'])
      .optional(),
    
    search: vine
      .string()
      .trim()
      .minLength(2, 'Search term must be at least 2 characters')
      .maxLength(100)
      .optional(),
    
    // Pagination
    page: vine
      .number()
      .min(1, 'Page must be at least 1')
      .optional(),
    
    limit: vine
      .number()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .optional(),
    
    // Sorting
    sortBy: vine
      .enum([
        'createdAt',
        'updatedAt',
        'dueDate',
        'priority',
        'title',
        'completed'
      ])
      .optional(),
    
    order: vine
      .enum(['asc', 'desc'])
      .optional()
  })
);

/**
 * Validator for MongoDB ObjectId parameters
 * Used in: GET /api/v1/todos/:id, PATCH /api/v1/todos/:id, DELETE /api/v1/todos/:id
 */
export const todoIdValidation = vine.compile(
  vine.object({
    id: vine
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid todo ID format')
  })
);

/**
 * Validator for soft delete with reason
 * Used in: DELETE /api/v1/todos/:id (optional body)
 */
export const deleteTodoValidation = vine.compile(
  vine.object({
    reason: vine
      .string()
      .trim()
      .minLength(3, 'Reason must be at least 3 characters')
      .maxLength(200, 'Reason cannot exceed 200 characters')
      .optional()
  })
);

/**
 * Validator for bulk operations
 * Used in: POST /api/v1/todos/bulk-delete, POST /api/v1/todos/bulk-complete
 */
export const bulkTodoIdsValidation = vine.compile(
  vine.object({
    todoIds: vine
      .array(
        vine.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid todo ID format')
      )
      .minLength(1, 'At least one todo ID is required')
      .maxLength(50, 'Cannot process more than 50 todos at once'),
    
    reason: vine
      .string()
      .trim()
      .maxLength(200)
      .optional() // For bulk delete
  })
);

