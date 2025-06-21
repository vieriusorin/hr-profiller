import { Request } from 'express';
import { ResponseEnvelope, ErrorResponse } from '../../shared/types';
import {
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  CollectionMeta,
  FilterParams,
  SearchParams,
  SortParams,
  QueryParams,
  FilterBuilder,
  SearchBuilder,
  SortBuilder
} from '../../shared/types/presenter.types';
import { QueryParser } from '../../shared/utils/query-parser';

export abstract class EnhancedBasePresenter<TInput, TOutput> {
  protected filterBuilder?: FilterBuilder<TInput>;
  protected searchBuilder?: SearchBuilder<TInput>;
  protected sortBuilder?: SortBuilder<TInput>;

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

  abstract present(item: TInput, options?: any): TOutput;

  presentCollection(items: TInput[], options?: any): TOutput[] {
    return items.map(item => this.present(item, options));
  }

  protected createPaginationMeta(
    params: PaginationParams,
    totalCount: number
  ): PaginationMeta {
    const { page = 1, limit = 10 } = params;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };
  }

  protected applyFilters(data: TInput[], filters: FilterParams): TInput[] {
    if (!this.filterBuilder || !filters || Object.keys(filters).length === 0) {
      return data;
    }
    return this.filterBuilder.apply(data, filters);
  }

  protected applySearch(data: TInput[], search: SearchParams): TInput[] {
    if (!this.searchBuilder || !search.search) {
      return data;
    }
    return this.searchBuilder.apply(data, search);
  }

  protected applySort(data: TInput[], sort: SortParams): TInput[] {
    if (!this.sortBuilder || !sort.sortBy) {
      return data;
    }
    return this.sortBuilder.apply(data, sort);
  }

  protected applyPagination(data: TInput[], params: PaginationParams): TInput[] {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;
    return data.slice(offset, offset + limit);
  }

  protected processCollection(
    data: TInput[],
    queryParams: QueryParams
  ): {
    processedData: TInput[],
    totalFiltered: number,
    totalOriginal: number
  } {
    let processedData = [...data];
    const totalOriginal = data.length;

    // 1. Apply filters first
    if (queryParams.filters) {
      processedData = this.applyFilters(processedData, queryParams.filters);
    }

    // 2. Apply search
    if (queryParams.search) {
      processedData = this.applySearch(processedData, queryParams);
    }

    const totalFiltered = processedData.length;

    // 3. Apply sorting
    if (queryParams.sortBy) {
      processedData = this.applySort(processedData, queryParams);
    }

    // 4. Apply pagination (after filtering/searching/sorting)
    if (queryParams.page || queryParams.limit) {
      processedData = this.applyPagination(processedData, queryParams);
    }

    return { processedData, totalFiltered, totalOriginal };
  }

  success(item: TInput, meta?: Record<string, any>): ResponseEnvelope<TOutput> {
    const presentedData = this.present(item);
    return this.createEnvelope('success', presentedData, meta);
  }

  successCollection(
    items: TInput[],
    req?: Request,
    meta?: Record<string, any>
  ): ResponseEnvelope<TOutput[]> {
    const presentedData = this.presentCollection(items);

    const collectionMeta: CollectionMeta = {
      count: items.length,
      timestamp: new Date().toISOString(),
      endpoint: req?.originalUrl,
      ...meta,
    };

    return this.createEnvelope('success', presentedData, collectionMeta);
  }

  successPaginated(
    items: TInput[],
    req: Request,
    meta?: Record<string, any>
  ): ResponseEnvelope<PaginatedResponse<TOutput>> {
    const queryParams = QueryParser.parseAll(req);
    const { processedData, totalFiltered, totalOriginal } = this.processCollection(items, queryParams);
    const presentedData = this.presentCollection(processedData);
    const paginationMeta = this.createPaginationMeta(queryParams, totalFiltered);

    const response: PaginatedResponse<TOutput> = {
      data: presentedData,
      pagination: paginationMeta,
      filters: queryParams.filters,
      search: queryParams.search ? { search: queryParams.search, searchFields: queryParams.searchFields } : undefined,
      sort: queryParams.sortBy ? { sortBy: queryParams.sortBy, sortOrder: queryParams.sortOrder } : undefined,
    };

    const responseMeta = {
      count: presentedData.length,
      filtered: totalFiltered,
      total: totalOriginal,
      timestamp: new Date().toISOString(),
      endpoint: req.originalUrl,
      ...meta,
    };

    return this.createEnvelope('success', response, responseMeta);
  }

  error(error: any): ResponseEnvelope<ErrorResponse> {
    const errorData: ErrorResponse = {
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'INTERNAL_ERROR',
    };

    // Include validation details if provided
    if (error.details) {
      errorData.details = error.details;
    }

    if (process.env.NODE_ENV === 'development' && error.stack) {
      errorData.stack = error.stack;
    }

    return this.createEnvelope('error', errorData);
  }

  setFilterBuilder(builder: FilterBuilder<TInput>): this {
    this.filterBuilder = builder;
    return this;
  }

  setSearchBuilder(builder: SearchBuilder<TInput>): this {
    this.searchBuilder = builder;
    return this;
  }

  setSortBuilder(builder: SortBuilder<TInput>): this {
    this.sortBuilder = builder;
    return this;
  }
} 