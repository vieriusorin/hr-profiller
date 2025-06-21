import { EmployeeProfile } from '../../../domain/employee/entities/employee-profile.entity';
import {
  FilterBuilder,
  SearchBuilder,
  SortBuilder,
  FilterParams,
  SearchParams,
  SortParams
} from '../../../shared/types/presenter.types';

export class EmployeeFilterBuilder implements FilterBuilder<EmployeeProfile> {
  apply(employees: EmployeeProfile[], filters: FilterParams): EmployeeProfile[] {
    return employees.filter(employee => {
      // Position filter
      if (filters.position) {
        const position = employee.employment.position || '';
        const positionMatch = position
          .toLowerCase()
          .includes(filters.position.toLowerCase());
        if (!positionMatch) return false;
      }

      // Employee status filter
      if (filters.employeeStatus) {
        if (employee.employment.employeeStatus !== filters.employeeStatus) return false;
      }

      // Work status filter
      if (filters.workStatus) {
        if (employee.employment.workStatus !== filters.workStatus) return false;
      }

      // Job grade filter
      if (filters.jobGrade) {
        if (employee.employment.jobGrade !== filters.jobGrade) return false;
      }

      // Location filter
      if (filters.location) {
        const location = employee.employment.location || '';
        const locationMatch = location
          .toLowerCase()
          .includes(filters.location.toLowerCase());
        if (!locationMatch) return false;
      }

      // Active filter (based on employee status)
      if (typeof filters.isActive === 'boolean') {
        const isActive = employee.isActive;
        if (filters.isActive !== isActive) return false;
      }

      // Hire date range filter
      if (filters.dateRange && employee.employment.hireDate) {
        const hireDate = new Date(employee.employment.hireDate);

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

  validate(filters: FilterParams): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
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
export class EmployeeSearchBuilder implements SearchBuilder<EmployeeProfile> {
  private readonly searchableFields = [
    'firstName',
    'lastName',
    'fullName',
    'email',
    'position',
    'location'
  ];

  apply(employees: EmployeeProfile[], search: SearchParams): EmployeeProfile[] {
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

  private getFieldValue(employee: EmployeeProfile, field: string): string {
    switch (field) {
      case 'firstName':
        return employee.person.firstName || '';
      case 'lastName':
        return employee.person.lastName || '';
      case 'fullName':
        return employee.person.fullName || '';
      case 'email':
        return employee.person.email || '';
      case 'position':
        return employee.employment.position || '';
      case 'location':
        return employee.employment.location || '';
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
export class EmployeeSortBuilder implements SortBuilder<EmployeeProfile> {
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

  apply(employees: EmployeeProfile[], sort: SortParams): EmployeeProfile[] {
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

  private getFieldValue(employee: EmployeeProfile, field: string): any {
    switch (field) {
      case 'firstName':
        return employee.person.firstName;
      case 'lastName':
        return employee.person.lastName;
      case 'fullName':
        return employee.person.fullName;
      case 'email':
        return employee.person.email;
      case 'position':
        return employee.employment.position;
      case 'hireDate':
        return employee.employment.hireDate ? new Date(employee.employment.hireDate) : null;
      case 'employeeStatus':
        return employee.employment.employeeStatus;
      case 'workStatus':
        return employee.employment.workStatus;
      case 'jobGrade':
        return employee.employment.jobGrade;
      case 'location':
        return employee.employment.location;
      default:
        return null;
    }
  }

  getSortableFields(): string[] {
    return [...this.sortableFields];
  }
} 