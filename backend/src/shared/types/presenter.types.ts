/**
 * @description Common pagination, sorting, searching, and filtering parameters for API requests.
 * @interface PaginationParams
 * @property page - The current page number
 * @property limit - The number of items per page
 * @property offset - The offset for pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * @description Metadata for paginated responses.
 * @interface PaginationMeta
 * @property page - The current page number
 * @property limit - The number of items per page
 * @property total - The total number of items
 * @property totalPages - The total number of pages
 * @property hasNextPage - Indicates if there is a next page
 * @property hasPreviousPage - Indicates if there is a previous page
 * @property nextPage - The next page number, or null if none
 * @property previousPage - The previous page number, or null if none
 */
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

/**
 * @description Sorting parameters for API requests.
 * @interface SortParams
 * @property sortBy - The field to sort by
 * @property sortOrder - The order of sorting ('asc' or 'desc')
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * @description Searching parameters for API requests.
 * @interface SearchParams
 * @property search - The search query string
 * @property searchFields - The fields to apply the search on
 */
export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

/**
 * @description Filtering parameters for API requests.
 * @interface FilterParams
 * @property [key: string] - Dynamic filter fields and their values
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * @description Combined query parameters for API requests, including pagination, sorting, searching, and filtering.
 * @interface QueryParams
 * @extends PaginationParams, SortParams, SearchParams
 * @property filters - Filtering parameters
 * @property status - Status filter
 * @property client - Client filter
 * @property probability - Probability filter
 */
export interface QueryParams extends PaginationParams, SortParams, SearchParams {
  filters?: FilterParams;
  status?: string;
  client?: string;
  probability?: string;
}

/**
 * @description Paginated response structure for API responses.
 * @interface PaginatedResponse
 * @template T - The type of the data items in the response
 * @property data - The array of data items
 * @property pagination - Pagination metadata
 * @property filters - Optional applied filters
 * @property search - Optional applied search parameters
 * @property sort - Optional applied sort parameters
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  filters?: FilterParams;
  search?: SearchParams;
  sort?: SortParams;
}

/**
 * @description Metadata for a collection response.
 * @interface CollectionMeta
 * @extends Partial<PaginationMeta>
 */
export interface CollectionMeta extends Partial<PaginationMeta> {
  count: number;
  filtered?: number;
  timestamp: string;
  endpoint?: string;
  filters?: FilterParams;
  search?: SearchParams;
  sort?: SortParams;
}

/**
 * @description Filters specific to Opportunity entities.
 * @interface OpportunityFilters
 * @property client - Filter by client name
 * @property grades - Filter by an array of grades
 * @property needsHire - Filter by hiring need ('yes', 'no', 'all')
 * @property probability - Filter by probability range as a tuple [min, max]
 * @property status - Filter by opportunity status
 * @property isActive - Filter by active status
 * @property dateRange - Filter by a date range with optional start and end dates
 */
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

/**
 * @description Filter builder interface
 * @interface FilterBuilder
 * @template T - The type of data to be filtered
 * @method apply - Applies the filters to the data
 * @method validate - Validates the provided filters
 * @method sanitize - Sanitizes the provided filters
 */
export interface FilterBuilder<T = any> {
  apply(data: T[], filters: FilterParams): T[];
  validate(filters: FilterParams): boolean;
  sanitize(filters: FilterParams): FilterParams;
}

/**
 * @description Search builder interface
 * @interface SearchBuilder
 * @template T - The type of data to be searched
 * @method apply - Applies the search to the data
 * @method getSearchableFields - Retrieves the fields that can be searched
 */ 
export interface SearchBuilder<T = any> {
  apply(data: T[], search: SearchParams): T[];
  getSearchableFields(): string[];
}

/**
 * @description Sort builder interface
 * @interface SortBuilder
 * @template T - The type of data to be sorted
 * @method apply - Applies the sorting to the data
 * @method getSortableFields - Retrieves the fields that can be sorted
 */
export interface SortBuilder<T = any> {
  apply(data: T[], sort: SortParams): T[];
  getSortableFields(): string[];
} 