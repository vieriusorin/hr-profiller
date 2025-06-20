import { Employee } from '../../../domain/employee/entities/employee.entity';
import { 
  FilterBuilder, 
  SearchBuilder, 
  SortBuilder,
  FilterParams,
  SearchParams,
  SortParams
} from '../../../shared/types/presenter.types';

export class EmployeeFilterBuilder implements FilterBuilder<Employee> {
  apply(employees: Employee[], filters: FilterParams): Employee[] {
    return employees.filter(employee => {
      // Position filter
      if (filters.position) {
        const position = employee.position || '';
        const positionMatch = position
          .toLowerCase()
          .includes(filters.position.toLowerCase());
        if (!positionMatch) return false;
      }

      // Employee status filter
      if (filters.employeeStatus) {
        if (employee.employeeStatus !== filters.employeeStatus) return false;
      }

      // Work status filter
      if (filters.workStatus) {
        if (employee.workStatus !== filters.workStatus) return false;
      }

      // Job grade filter
      if (filters.jobGrade) {
        if (employee.jobGrade !== filters.jobGrade) return false;
      }

      // Location filter
      if (filters.location) {
        const location = employee.location || '';
        const locationMatch = location
          .toLowerCase()
          .includes(filters.location.toLowerCase());
        if (!locationMatch) return false;
      }

      // Active filter (based on employee status)
      if (typeof filters.isActive === 'boolean') {
        const isActive = employee.employeeStatus === 'Active';
        if (filters.isActive !== isActive) return false;
      }

      // Hire date range filter
      if (filters.dateRange && employee.hireDate) {
        const hireDate = new Date(employee.hireDate);
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (hireDate < startDate) return false;
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          if (hireDate > endDate) return false;
        }
      }

      return true;
    });
  }

  validate(filters: FilterParams): boolean {
    // Add validation logic as needed
    return true;
  }

  sanitize(filters: FilterParams): FilterParams {
    const sanitized = { ...filters };
    
    // Sanitize string filters
    if (typeof sanitized.position === 'string') {
      sanitized.position = sanitized.position.trim();
    }
    
    if (typeof sanitized.location === 'string') {
      sanitized.location = sanitized.location.trim();
    }

    return sanitized;
  }
}

/**
 * Employee Search Builder - full-text search across multiple fields
 */
export class EmployeeSearchBuilder implements SearchBuilder<Employee> {
  private readonly searchableFields = [
    'firstName',
    'lastName',
    'fullName',
    'email',
    'position',
    'location'
  ];

  apply(employees: Employee[], search: SearchParams): Employee[] {
    if (!search.search) return employees;

    const searchTerm = search.search.toLowerCase();
    const fieldsToSearch = search.searchFields || this.searchableFields;

    return employees.filter(employee => {
      return fieldsToSearch.some(field => {
        const value = this.getFieldValue(employee, field);
        return value && value.toLowerCase().includes(searchTerm);
      });
    });
  }

  private getFieldValue(employee: Employee, field: string): string {
    switch (field) {
      case 'firstName':
        return employee.firstName || '';
      case 'lastName':
        return employee.lastName || '';
      case 'fullName':
        return employee.fullName || '';
      case 'email':
        return employee.email || '';
      case 'position':
        return employee.position || '';
      case 'location':
        return employee.location || '';
      default:
        return '';
    }
  }

  getSearchableFields(): string[] {
    return [...this.searchableFields];
  }
}

/**
 * Employee Sort Builder - sort by various fields
 */
export class EmployeeSortBuilder implements SortBuilder<Employee> {
  private readonly sortableFields = [
    'firstName',
    'lastName',
    'fullName',
    'email',
    'position',
    'hireDate',
    'employeeStatus',
    'workStatus',
    'jobGrade',
    'location'
  ];

  apply(employees: Employee[], sort: SortParams): Employee[] {
    if (!sort.sortBy || !this.sortableFields.includes(sort.sortBy)) {
      return employees;
    }

    const sortOrder = sort.sortOrder || 'asc';
    
    return [...employees].sort((a, b) => {
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

  private getFieldValue(employee: Employee, field: string): any {
    switch (field) {
      case 'firstName':
        return employee.firstName;
      case 'lastName':
        return employee.lastName;
      case 'fullName':
        return employee.fullName;
      case 'email':
        return employee.email;
      case 'position':
        return employee.position;
      case 'hireDate':
        return employee.hireDate;
      case 'employeeStatus':
        return employee.employeeStatus;
      case 'workStatus':
        return employee.workStatus;
      case 'jobGrade':
        return employee.jobGrade;
      case 'location':
        return employee.location;
      default:
        return null;
    }
  }

  getSortableFields(): string[] {
    return [...this.sortableFields];
  }
} 