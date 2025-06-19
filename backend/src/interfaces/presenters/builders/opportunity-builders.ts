import { Opportunity } from '../../../domain/opportunity/entities/opportunity.entity';
import { 
  FilterBuilder, 
  SearchBuilder, 
  SortBuilder,
  FilterParams,
  SearchParams,
  SortParams,
  OpportunityFilters 
} from '../../../shared/types/presenter.types';


export class OpportunityFilterBuilder implements FilterBuilder<Opportunity> {
  apply(opportunities: Opportunity[], filters: FilterParams | OpportunityFilters): Opportunity[] {
    return opportunities.filter(opportunity => {
       if (filters.client) {
         const clientName = opportunity.clientName || '';
         const clientMatch = clientName
           .toLowerCase()
           .includes(filters.client.toLowerCase());
         if (!clientMatch) return false;
       }

      if (filters.grades && Array.isArray(filters.grades) && filters.grades.length > 0) {
        // Note: Assuming opportunity has roles with grades
        // You'll need to adapt this to your actual Opportunity entity structure
        const hasMatchingGrade = true; // TODO: Implement based on your entity structure
        if (!hasMatchingGrade) return false;
      }

      // Needs hire filter
      if (filters.needsHire && filters.needsHire !== 'all') {
        const needsHire = filters.needsHire === 'yes';
        // TODO: Implement based on your business logic
        // For now, assuming all opportunities need hire
        const opportunityNeedsHire = true;
        if (needsHire !== opportunityNeedsHire) return false;
      }

             // Probability range filter
       if (filters.probability && Array.isArray(filters.probability)) {
         const [min, max] = filters.probability;
         const probability = opportunity.probability || 0;
         if (probability < min || probability > max) {
           return false;
         }
       }

      // Status filter
      if (filters.status) {
        if (opportunity.status !== filters.status) return false;
      }

      // Active filter
      if (typeof filters.isActive === 'boolean') {
        if (opportunity.isActive !== filters.isActive) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const oppDate = new Date(opportunity.createdAt);
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (oppDate < startDate) return false;
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          if (oppDate > endDate) return false;
        }
      }

      return true;
    });
  }

  validate(filters: FilterParams): boolean {
    // Add validation logic as needed
    if (filters.probability && Array.isArray(filters.probability)) {
      const [min, max] = filters.probability;
      return min >= 0 && max <= 100 && min <= max;
    }
    return true;
  }

  sanitize(filters: FilterParams): FilterParams {
    const sanitized = { ...filters };
    
    // Sanitize probability range
    if (sanitized.probability && Array.isArray(sanitized.probability)) {
      const [min, max] = sanitized.probability;
      sanitized.probability = [
        Math.max(0, Math.min(100, min)),
        Math.max(0, Math.min(100, max))
      ];
    }

    // Sanitize client search
    if (typeof sanitized.client === 'string') {
      sanitized.client = sanitized.client.trim();
    }

    return sanitized;
  }
}

/**
 * Opportunity Search Builder - full-text search across multiple fields
 */
export class OpportunitySearchBuilder implements SearchBuilder<Opportunity> {
  private readonly searchableFields = [
    'opportunityName',
    'clientName',
    'comment'
  ];

  apply(opportunities: Opportunity[], search: SearchParams): Opportunity[] {
    if (!search.search) return opportunities;

    const searchTerm = search.search.toLowerCase();
    const fieldsToSearch = search.searchFields || this.searchableFields;

    return opportunities.filter(opportunity => {
      return fieldsToSearch.some(field => {
        const value = this.getFieldValue(opportunity, field);
        return value && value.toLowerCase().includes(searchTerm);
      });
    });
  }

  private getFieldValue(opportunity: Opportunity, field: string): string {
    switch (field) {
      case 'opportunityName':
        return opportunity.opportunityName || '';
      case 'clientName':
        return opportunity.clientName || '';
      case 'comment':
        return opportunity.comment || '';
      default:
        return '';
    }
  }

  getSearchableFields(): string[] {
    return [...this.searchableFields];
  }
}

/**
 * Opportunity Sort Builder - sort by various fields
 */
export class OpportunitySortBuilder implements SortBuilder<Opportunity> {
  private readonly sortableFields = [
    'opportunityName',
    'clientName',
    'probability',
    'createdAt',
    'updatedAt',
    'status'
  ];

  apply(opportunities: Opportunity[], sort: SortParams): Opportunity[] {
    if (!sort.sortBy || !this.sortableFields.includes(sort.sortBy)) {
      return opportunities;
    }

    const sortOrder = sort.sortOrder || 'asc';
    
    return [...opportunities].sort((a, b) => {
      const aValue = this.getFieldValue(a, sort.sortBy!);
      const bValue = this.getFieldValue(b, sort.sortBy!);

      let result = 0;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        result = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        result = aValue.getTime() - bValue.getTime();
      } else {
        // String comparison
        const aStr = String(aValue || '').toLowerCase();
        const bStr = String(bValue || '').toLowerCase();
        result = aStr.localeCompare(bStr);
      }

      return sortOrder === 'desc' ? -result : result;
    });
  }

  private getFieldValue(opportunity: Opportunity, field: string): any {
    switch (field) {
      case 'opportunityName':
        return opportunity.opportunityName;
      case 'clientName':
        return opportunity.clientName;
      case 'probability':
        return opportunity.probability;
      case 'createdAt':
        return new Date(opportunity.createdAt);
      case 'updatedAt':
        return new Date(opportunity.updatedAt);
      case 'status':
        return opportunity.status;
      default:
        return '';
    }
  }

  getSortableFields(): string[] {
    return [...this.sortableFields];
  }
} 