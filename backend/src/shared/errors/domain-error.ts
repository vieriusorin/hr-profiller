/**
 * @description Custom Domain Error class for handling domain-specific errors.
 * @class DomainError
 * @extends Error
 * @method constructor - Initializes the error with a message.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
