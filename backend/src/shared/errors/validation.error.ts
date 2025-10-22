import { ApplicationError } from './application.error';

/**
 * @description Custom Validation Error class for handling validation errors.
 * @class ValidationError
 * @extends ApplicationError
 * @method constructor - Initializes the error with a message.
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}
