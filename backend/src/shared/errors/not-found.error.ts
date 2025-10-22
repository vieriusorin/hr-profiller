import { ApplicationError } from './application.error';
/**
 * @description Custom Not Found Error class for handling not found errors.
 * @class NotFoundError
 * @extends ApplicationError
 * @method constructor - Initializes the error with a message.
 */
export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}
