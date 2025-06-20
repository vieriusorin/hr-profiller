import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { EmployeeRepository } from '../repositories/employee.repository';
import { Employee } from '../entities/employee.entity';
import { TypeNewEmployee, TypeUpdateEmployee } from '../../../../db/schema/employee.schema';

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

  async createEmployee(employeeData: TypeNewEmployee): Promise<Employee> {
    return this.employeeRepository.create(employeeData);
  }

  async updateEmployee(id: string, employeeData: TypeUpdateEmployee): Promise<Employee> {
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.update(id, employeeData);
  }

  async deleteEmployee(id: string): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.delete(id);
  }
} 