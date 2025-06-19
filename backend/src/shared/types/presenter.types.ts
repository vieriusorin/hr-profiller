// ================================================================
// PRESENTER TYPES - Unified Response System
// Supports pagination, filtering, search, and sorting
// ================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams extends PaginationParams, SortParams, SearchParams {
  filters?: FilterParams;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  filters?: FilterParams;
  search?: SearchParams;
  sort?: SortParams;
}

export interface CollectionMeta extends Partial<PaginationMeta> {
  count: number;
  filtered?: number;
  timestamp: string;
  endpoint?: string;
  filters?: FilterParams;
  search?: SearchParams;
  sort?: SortParams;
}

// Opportunity-specific filter types (based on your frontend)
export interface OpportunityFilters {
  client?: string;
  grades?: string[];
  needsHire?: 'yes' | 'no' | 'all';
  probability?: [number, number];
  status?: string;
  isActive?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// Generic filter builder interface
export interface FilterBuilder<T = any> {
  apply(data: T[], filters: FilterParams): T[];
  validate(filters: FilterParams): boolean;
  sanitize(filters: FilterParams): FilterParams;
}

// Search builder interface  
export interface SearchBuilder<T = any> {
  apply(data: T[], search: SearchParams): T[];
  getSearchableFields(): string[];
}

// Sort builder interface
export interface SortBuilder<T = any> {
  apply(data: T[], sort: SortParams): T[];
  getSortableFields(): string[];
} 