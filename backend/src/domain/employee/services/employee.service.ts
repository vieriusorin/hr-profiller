import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { EmployeeRepository } from '../repositories/employee.repository';
import { Employee } from '../entities/employee.entity';

@injectable()
export class EmployeeService {
  constructor(
    @inject(TYPES.EmployeeRepository)
    private readonly employeeRepository: EmployeeRepository
  ) {}

  async getAllEmployees(): Promise<Employee[]> {
    return this.employeeRepository.findAll();
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    return this.employeeRepository.findById(id);
  }
} 