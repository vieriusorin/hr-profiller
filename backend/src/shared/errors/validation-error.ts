/**
 * @description Custom Validation Error class for handling validation errors.
 * @class ValidationError
 * @extends Error
 * @method constructor - Initializes the error with a message and a map of field errors.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    readonly errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
