// @ts-nocheck
import { Employee } from '../../domain/employee/entities/employee.entity';
import { EmployeePresentation } from '../../shared/types/presentation.types';
import { EnhancedBasePresenter } from './enhanced-base.presenter';
import { 
  EmployeeFilterBuilder, 
  EmployeeSearchBuilder, 
  EmployeeSortBuilder 
} from './builders/employee-builders';

export class EmployeePresenter extends EnhancedBasePresenter<Employee, EmployeePresentation> {
  
  constructor() {
    super();
    
    // Set up the builders for filtering, searching, and sorting
    this.setFilterBuilder(new EmployeeFilterBuilder())
        .setSearchBuilder(new EmployeeSearchBuilder())
        .setSortBuilder(new EmployeeSortBuilder());
  }

  present(employee: Employee, options?: any): EmployeePresentation {
    const formattedEmployee = {
      ...employee,
      hireDate: employee.hireDate ? new Date(employee.hireDate) : null,
      terminationDate: employee.terminationDate ? new Date(employee.terminationDate) : null,
      birthDate: employee.birthDate ? new Date(employee.birthDate) : null,
    };

    return {
      // Add the consistent ID field first
      id: employee.id,
      ...formattedEmployee,
      // Add computed fields from business logic
      yearsOfExperience: employee.yearsOfExperience,
      isInactive: employee.isInactive(),
      isOnBench: employee.isOnBench(),
    };
  }
} 