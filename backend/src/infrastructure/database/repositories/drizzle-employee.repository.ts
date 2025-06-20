import { injectable, inject } from 'inversify';
import { sql } from 'drizzle-orm';
import { TYPES, DatabaseType } from '../../../shared/types';
import { Employee, EmployeeJoinedData } from '../../../domain/employee/entities/employee.entity';
import { EmployeeRepository } from '../../../domain/employee/repositories/employee.repository';

@injectable()
export class DrizzleEmployeeRepository implements EmployeeRepository {
  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) {}

  async findAll(): Promise<Employee[]> {
    const result = await this.db.execute(sql`
      SELECT 
        people.id as personId,
        people.first_name as firstName,
        people.last_name as lastName,
        people.full_name as fullName,
        people.email as email,
        people.phone as phone,
        people.birth_date as birthDate,
        people.address as address,
        people.city as city,
        people.country as country,
        people.notes as personNotes,
        people.created_at as personCreatedAt,
        employment_details.id as employmentDetailsId,
        employment_details.employee_id as employeeId,
        employment_details.hire_date as hireDate,
        employment_details.termination_date as terminationDate,
        employment_details.position as position,
        employment_details.employment_type as employmentType,
        employment_details.salary as salary,
        employment_details.hourly_rate as hourlyRate,
        employment_details.manager_id as managerId,
        employment_details.employee_status as employeeStatus,
        employment_details.work_status as workStatus,
        employment_details.job_grade as jobGrade,
        employment_details.location as location,
        employment_details.emergency_contact_name as emergencyContactName,
        employment_details.emergency_contact_phone as emergencyContactPhone,
        employment_details.notes as employmentNotes,
        employment_details.created_at as employmentCreatedAt,
        employment_details.updated_at as employmentUpdatedAt
      FROM people
      INNER JOIN employment_details ON people.id = employment_details.person_id
      WHERE employment_details.id IS NOT NULL
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmployeeJoinedData));
  }

  async findById(id: string): Promise<Employee | null> {
    const result = await this.db.execute(sql`
      SELECT 
        people.id as personId,
        people.first_name as firstName,
        people.last_name as lastName,
        people.full_name as fullName,
        people.email as email,
        people.phone as phone,
        people.birth_date as birthDate,
        people.address as address,
        people.city as city,
        people.country as country,
        people.notes as personNotes,
        people.created_at as personCreatedAt,
        employment_details.id as employmentDetailsId,
        employment_details.employee_id as employeeId,
        employment_details.hire_date as hireDate,
        employment_details.termination_date as terminationDate,
        employment_details.position as position,
        employment_details.employment_type as employmentType,
        employment_details.salary as salary,
        employment_details.hourly_rate as hourlyRate,
        employment_details.manager_id as managerId,
        employment_details.employee_status as employeeStatus,
        employment_details.work_status as workStatus,
        employment_details.job_grade as jobGrade,
        employment_details.location as location,
        employment_details.emergency_contact_name as emergencyContactName,
        employment_details.emergency_contact_phone as emergencyContactPhone,
        employment_details.notes as employmentNotes,
        employment_details.created_at as employmentCreatedAt,
        employment_details.updated_at as employmentUpdatedAt
      FROM people
      INNER JOIN employment_details ON people.id = employment_details.person_id
      WHERE people.id = ${id}
    `);

    return result.rows.length > 0 ? this.mapToEntity(result.rows[0] as EmployeeJoinedData) : null;
  }

  private mapToEntity(data: EmployeeJoinedData): Employee {
    return new Employee(data);
  }
}