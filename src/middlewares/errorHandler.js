// middlewares/errorHandler.js
import { errors as vineErrors } from '@vinejs/vine';
import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err, req, res, next) {
  console.error(err);

  // Your custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? [],
      data: err.data ?? null,
    });
  }

  // Vine validation error
  if (err instanceof vineErrors.E_VALIDATION_ERROR) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.messages, 
    });
  }

  // Fallback for any other errors
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}
