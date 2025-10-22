/**
 * @description Custom Application Error class for handling application-specific errors.
 * @class ApplicationError
 * @extends Error
 * @method constructor - Initializes the error with a message.
 */
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}
