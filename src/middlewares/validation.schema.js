import { ApiError } from '../utils/ApiError.js';
import { HttpStatus } from '../utils/httpStatusCodes.js';
import { errors as vineErrors } from '@vinejs/vine';

/**
 * Generic validation middleware
 * @param {Function} validator Vine validation function to validate request data
 * @returns {Function} Express middleware
 */
const validate = (validator) => async (req, res, next) => {
  try {
    
    await validator.validate(req.body);
    next();  
  } catch (error) {
    
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return next(new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, 'Validation failed', error.messages));
    }
    next(error); 
  }
};

export { validate };
