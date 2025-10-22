import { ErrorResponse, ResponseEnvelope } from '@shared/types';

/**
 * @description Base Presenter Class
 * @abstract
 * @class BasePresenter
 * @template T - The type of the input data
 * @template R - The type of the presented data
 * @method present - Abstract method to transform a single item
 * @method presentCollection - Method to transform a collection of items
 * @method success - Method to create a success response
 * @method successCollection - Method to create a success response for a collection
 * @method error - Method to create an error response
 * @protected createEnvelope - Helper method to create a standard response envelope
 */
export abstract class BasePresenter<T, R> {
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
  abstract present(item: T, options?: any): R;

  presentCollection(items: T[], options?: any): R[] {
    return items.map(item => this.present(item, options));
  }

  success(item: T, meta?: Record<string, any>): ResponseEnvelope<R> {
    const presentedData = this.present(item);
    return this.createEnvelope('success', presentedData, meta);
  }

  successCollection(items: T[], meta?: Record<string, any>): ResponseEnvelope<R[]> {
    const presentedData = this.presentCollection(items);
    return this.createEnvelope('success', presentedData, meta);
  }

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
