import { Employee } from '../entities/employee.entity';
import { TypeNewEmployee, TypeUpdateEmployee } from '../../../../db/schema/employee.schema';

export interface EmployeeRepository {
  findAll(): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  create(employeeData: TypeNewEmployee): Promise<Employee>;
  update(id: string, employeeData: TypeUpdateEmployee): Promise<Employee>;
  delete(id: string): Promise<void>;
} 