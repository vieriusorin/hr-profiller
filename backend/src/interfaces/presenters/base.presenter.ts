import { ErrorResponse, ResponseEnvelope } from '@shared/types';

/**
 * Base presenter class that all other presenters will extend
 */
export abstract class BasePresenter<T, R> {
  /**
   * Standard response envelope
   */
  protected createEnvelope<D>(
    status: 'success' | 'error',
    data: D,
    meta?: Record<string, any>
  ): ResponseEnvelope<D> {
    return {
      status,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Transform a single item
   */
  abstract present(item: T, options?: any): R;

  /**
   * Transform a collection of items
   */
  presentCollection(items: T[], options?: any): R[] {
    return items.map(item => this.present(item, options));
  }

  /**
   * Create a success response with properly formatted data
   */
  success(item: T, meta?: Record<string, any>): ResponseEnvelope<R> {
    const presentedData = this.present(item);
    return this.createEnvelope('success', presentedData, meta);
  }

  /**
   * Create a success response for a collection
   */
  successCollection(items: T[], meta?: Record<string, any>): ResponseEnvelope<R[]> {
    const presentedData = this.presentCollection(items);
    return this.createEnvelope('success', presentedData, meta);
  }

  /**
   * Create an error response
   */
  error(error: any): ResponseEnvelope<ErrorResponse> {
    const errorData: ErrorResponse = {
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'INTERNAL_ERROR',
    };

    // Add stack trace in development environment
    if (process.env.NODE_ENV === 'development' && error.stack) {
      errorData.stack = error.stack;
    }

    return this.createEnvelope('error', errorData);
  }
}
