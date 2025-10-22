import { ApplicationError } from './application.error';
/**
 * @description Custom Domain Error class for handling domain-specific errors.
 * @class DomainError
 * @extends ApplicationError
 * @method constructor - Initializes the error with a message.
 */

export class DomainError extends ApplicationError {
  constructor(message: string, details?: any) {
    super('DOMAIN_ERROR', message, 400, details);
    this.name = 'DomainError';
  }
}
