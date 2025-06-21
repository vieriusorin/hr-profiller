import { Request } from 'express';
import {
  PaginationParams,
  SortParams,
  SearchParams,
  FilterParams,
  QueryParams,
  OpportunityFilters
} from '../types/presenter.types';

const getFullUrl = (req: Request): URL => {
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost';
  return new URL(req.originalUrl || req.url || '/', `${protocol}://${host}`);
};

export class QueryParser {
  /**
   * Parse pagination parameters from request
   */
  static parsePagination(req: Request): PaginationParams {
    const { searchParams } = getFullUrl(req);

    const page = Math.max(1, parseInt(searchParams.get('_page') || searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('_limit') || searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  static parseSort(req: Request): SortParams {
    const { searchParams } = getFullUrl(req);

    const sortBy = searchParams.get('sortBy') || searchParams.get('_sort') || undefined;
    const sortOrder = (searchParams.get('sortOrder') || searchParams.get('_order') || 'asc') as 'asc' | 'desc';

    return { sortBy, sortOrder };
  }

  static parseSearch(req: Request): SearchParams {
    const { searchParams } = getFullUrl(req);

    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const searchFields = searchParams.get('searchFields')?.split(',');

    return { search, searchFields };
  }

  static parseFilters(req: Request, excludeKeys: string[] = []): FilterParams {
    const { searchParams } = getFullUrl(req);
    const filters: FilterParams = {};

    const defaultExcludeKeys = [
      '_page', 'page', '_limit', 'limit',
      'sortBy', '_sort', 'sortOrder', '_order',
      'search', 'q', 'searchFields'
    ];

    const allExcludeKeys = [...defaultExcludeKeys, ...excludeKeys];

    // Use forEach instead of for...of to avoid iterator issues
    searchParams.forEach((value, key) => {
      if (!allExcludeKeys.includes(key) && value) {
        if (value.includes(',')) {
          filters[key] = value.split(',');
        }
        // Handle range values (dash-separated numbers)
        else if (key.includes('Range') || key === 'probability') {
          const parts = value.split('-').map(Number);
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            filters[key] = parts;
          } else {
            filters[key] = value;
          }
        }
        // Handle boolean values
        else if (value === 'true' || value === 'false') {
          filters[key] = value === 'true';
        }
        // Handle numbers
        else if (!isNaN(Number(value))) {
          filters[key] = Number(value);
        }
        // Default to string
        else {
          filters[key] = value;
        }
      }
    });

    return filters;
  }

  static parseOpportunityFilters(req: Request): OpportunityFilters {
    const { searchParams } = getFullUrl(req);

    const filters: OpportunityFilters = {};

    const client = searchParams.get('client');
    if (client) filters.client = client;

    const grades = searchParams.get('grades');
    if (grades) filters.grades = grades.split(',');

    const needsHire = searchParams.get('needsHire') as 'yes' | 'no' | 'all';
    if (needsHire && ['yes', 'no', 'all'].includes(needsHire)) {
      filters.needsHire = needsHire;
    }

    const probability = searchParams.get('probability');
    if (probability) {
      const parts = probability.split('-').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        filters.probability = [parts[0], parts[1]];
      }
    }

    const status = searchParams.get('status');
    if (status) filters.status = status;

    const isActive = searchParams.get('isActive');
    if (isActive !== null) filters.isActive = isActive === 'true';

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      filters.dateRange = {};
      if (startDate) filters.dateRange.start = startDate;
      if (endDate) filters.dateRange.end = endDate;
    }

    return filters;
  }

  static parseAll(req: Request): QueryParams {
    return {
      ...this.parsePagination(req),
      ...this.parseSort(req),
      ...this.parseSearch(req),
      filters: this.parseFilters(req),
    };
  }
} 