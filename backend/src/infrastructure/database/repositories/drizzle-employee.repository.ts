import { injectable, inject } from 'inversify';
import { sql, eq } from 'drizzle-orm';
import { TYPES, DatabaseType } from '../../../shared/types';
import { Employee, EmployeeJoinedData } from '../../../domain/employee/entities/employee.entity';
import { EmployeeRepository } from '../../../domain/employee/repositories/employee.repository';
import { 
  CreateEmployeeSchema, 
  UpdateEmployeeSchema,
  PersonUpdateSchema,
  EmploymentUpdateSchema,
  EmployeeIdSchema,
  TypeNewEmployee, 
  TypeUpdateEmployee,
  TypePersonUpdate,
  TypeEmploymentUpdate
} from '../../../../db/schema/employee.schema';
import { people } from '../../../../db/schema/people.schema';
import { employmentDetails } from '../../../../db/schema/employment-details.schema';

@injectable()
export class DrizzleEmployeeRepository implements EmployeeRepository {
  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) {}

  async findAll(): Promise<Employee[]> {
    const result = await this.db.execute(sql`
      SELECT 
        people.id as "personId",
        people.first_name as "firstName",
        people.last_name as "lastName",
        people.email as "email",
        people.phone as "phone",
        people.birth_date as "birthDate",
        people.address as "address",
        people.city as "city",
        people.country as "country",
        people.notes as "personNotes",
        people.created_at as "personCreatedAt",
        employment_details.id as "employmentDetailsId",
        employment_details.employee_id as "employeeId",
        employment_details.hire_date as "hireDate",
        employment_details.termination_date as "terminationDate",
        employment_details.position as "position",
        employment_details.employment_type as "employmentType",
        employment_details.salary as "salary",
        employment_details.hourly_rate as "hourlyRate",
        employment_details.manager_id as "managerId",
        employment_details.employee_status as "employeeStatus",
        employment_details.work_status as "workStatus",
        employment_details.job_grade as "jobGrade",
        employment_details.location as "location",
        employment_details.emergency_contact_name as "emergencyContactName",
        employment_details.emergency_contact_phone as "emergencyContactPhone",
        employment_details.notes as "employmentNotes",
        employment_details.created_at as "employmentCreatedAt",
        employment_details.updated_at as "employmentUpdatedAt"
      FROM people
      INNER JOIN employment_details ON people.id = employment_details.person_id
      WHERE employment_details.id IS NOT NULL
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmployeeJoinedData));
  }

  async findById(id: string): Promise<Employee | null> {
    // Validate ID with Zod
    const result = EmployeeIdSchema.safeParse(id);
    if (!result.success) {
      throw new Error(`Invalid employee ID: ${result.error.issues.map(i => i.message).join(', ')}`);
    }
    const validatedId = result.data;

    const queryResult = await this.db.execute(sql`
      SELECT 
        people.id as "personId",
        people.first_name as "firstName",
        people.last_name as "lastName",
        people.email as "email",
        people.phone as "phone",
        people.birth_date as "birthDate",
        people.address as "address",
        people.city as "city",
        people.country as "country",
        people.notes as "personNotes",
        people.created_at as "personCreatedAt",
        employment_details.id as "employmentDetailsId",
        employment_details.employee_id as "employeeId",
        employment_details.hire_date as "hireDate",
        employment_details.termination_date as "terminationDate",
        employment_details.position as "position",
        employment_details.employment_type as "employmentType",
        employment_details.salary as "salary",
        employment_details.hourly_rate as "hourlyRate",
        employment_details.manager_id as "managerId",
        employment_details.employee_status as "employeeStatus",
        employment_details.work_status as "workStatus",
        employment_details.job_grade as "jobGrade",
        employment_details.location as "location",
        employment_details.emergency_contact_name as "emergencyContactName",
        employment_details.emergency_contact_phone as "emergencyContactPhone",
        employment_details.notes as "employmentNotes",
        employment_details.created_at as "employmentCreatedAt",
        employment_details.updated_at as "employmentUpdatedAt"
      FROM people
      INNER JOIN employment_details ON people.id = employment_details.person_id
      WHERE people.id = ${validatedId}
    `);

    return queryResult.rows.length > 0 ? this.mapToEntity(queryResult.rows[0] as EmployeeJoinedData) : null;
  }

  async create(employeeData: TypeNewEmployee): Promise<Employee> {
    // Validate and transform with Zod
    const result = CreateEmployeeSchema.safeParse(employeeData);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
    }
    const validatedData = result.data;

    return await this.db.transaction(async (tx) => {
      // Create person record - Zod has already transformed all the data
      const personResult = await tx.execute(sql`
        INSERT INTO people (first_name, last_name, email, phone, birth_date, address, city, country, notes)
        VALUES (
          ${validatedData.firstName},
          ${validatedData.lastName},
          ${validatedData.email},
          ${validatedData.phone},
          ${validatedData.birthDate},
          ${validatedData.address},
          ${validatedData.city},
          ${validatedData.country},
          ${validatedData.personNotes}
        )
        RETURNING id
      `);

      const personId = personResult.rows[0].id;

      // Create employment details - Zod has already transformed all the data
      await tx.execute(sql`
        INSERT INTO employment_details (
          person_id, hire_date, position, employment_type, salary, hourly_rate, 
          manager_id, employee_status, work_status, job_grade, location,
          emergency_contact_name, emergency_contact_phone, notes
        )
        VALUES (
          ${personId},
          ${validatedData.hireDate},
          ${validatedData.position},
          ${validatedData.employmentType},
          ${validatedData.salary},
          ${validatedData.hourlyRate},
          ${validatedData.managerId},
          ${validatedData.employeeStatus},
          ${validatedData.workStatus},
          ${validatedData.jobGrade},
          ${validatedData.location},
          ${validatedData.emergencyContactName},
          ${validatedData.emergencyContactPhone},
          ${validatedData.employmentNotes}
        )
      `);

      // Return the created employee
      const createdEmployee = await this.findById(personId as string);
      if (!createdEmployee) {
        throw new Error('Failed to retrieve created employee');
      }

      return createdEmployee;
    });
  }

  async update(id: string, employeeData: TypeUpdateEmployee): Promise<Employee> {
    // Validate ID with Zod
    const idResult = EmployeeIdSchema.safeParse(id);
    if (!idResult.success) {
      throw new Error(`Invalid employee ID: ${idResult.error.issues.map(i => i.message).join(', ')}`);
    }
    const validatedId = idResult.data;

    // Validate and transform employee data with Zod
    const dataResult = UpdateEmployeeSchema.safeParse(employeeData);
    if (!dataResult.success) {
      throw new Error(`Validation failed: ${dataResult.error.issues.map(i => i.message).join(', ')}`);
    }
    const validatedData = dataResult.data;

    console.log('Updating employee with ID:', validatedId);
    console.log('Update data:', validatedData);

    return await this.db.transaction(async (tx) => {
      // Prepare person update data using Zod schema
      const personData = this.extractPersonData(validatedData);
      const personResult = PersonUpdateSchema.safeParse(personData);
      
      if (personResult.success && Object.keys(personResult.data).length > 0) {
        const personUpdateData = {
          ...personResult.data,
          birthDate: personResult.data.birthDate?.toISOString().split('T')[0]
        };
        console.log('Executing person update with data:', personUpdateData);
        await tx.update(people).set(personUpdateData).where(eq(people.id, validatedId));
      }

      // Prepare employment update data using Zod schema
      const employmentData = this.extractEmploymentData(validatedData);
      const employmentResult = EmploymentUpdateSchema.safeParse(employmentData);
      
      if (employmentResult.success && Object.keys(employmentResult.data).length > 0) {
        const employmentUpdateData = employmentResult.data;
        console.log('Executing employment update with data:', employmentUpdateData);
        await tx.update(employmentDetails).set(employmentUpdateData).where(eq(employmentDetails.personId, validatedId));
      }

      // Return the updated employee
      const updatedEmployee = await this.findById(validatedId);
      if (!updatedEmployee) {
        throw new Error('Failed to retrieve updated employee');
      }

      console.log('Successfully updated employee');
      return updatedEmployee;
    });
  }

  async delete(id: string): Promise<void> {
    // Validate ID with Zod
    const result = EmployeeIdSchema.safeParse(id);
    if (!result.success) {
      throw new Error(`Invalid employee ID: ${result.error.issues.map(i => i.message).join(', ')}`);
    }
    const validatedId = result.data;

    console.log('Deleting employee with ID:', validatedId);
    
    await this.db.transaction(async (tx) => {
      // Delete in correct order to avoid foreign key violations
      await tx.execute(sql`DELETE FROM employment_details WHERE person_id = ${validatedId}`);
      await tx.execute(sql`DELETE FROM person_status WHERE person_id = ${validatedId}`);
      await tx.execute(sql`DELETE FROM person_skills WHERE person_id = ${validatedId}`);
      await tx.execute(sql`DELETE FROM person_technologies WHERE person_id = ${validatedId}`);
      await tx.execute(sql`DELETE FROM education WHERE person_id = ${validatedId}`);
      await tx.execute(sql`DELETE FROM person_unavailable_dates WHERE person_id = ${validatedId}`);
      await tx.execute(sql`DELETE FROM opportunity_role_assignments WHERE person_id = ${validatedId}`);
      await tx.execute(sql`DELETE FROM people WHERE id = ${validatedId}`);
      
      console.log('Successfully deleted employee and all related records');
    });
  }

  // Helper to extract person-related fields from update data
  private extractPersonData(data: TypeUpdateEmployee): Partial<TypePersonUpdate> {
    const personFields: (keyof TypeUpdateEmployee)[] = [
      'firstName', 'lastName', 'email', 'phone', 'birthDate', 
      'address', 'city', 'country', 'personNotes'
    ];
    
    const personData: any = {};
    personFields.forEach(field => {
      if (data[field] !== undefined) {
        if (field === 'personNotes') {
          personData.notes = data[field]; // Map to 'notes' for DB
        } else {
          personData[field] = data[field];
        }
      }
    });
    
    return personData;
  }

  // Helper to extract employment-related fields from update data
  private extractEmploymentData(data: TypeUpdateEmployee): Partial<TypeEmploymentUpdate> {
    const employmentFields: (keyof TypeUpdateEmployee)[] = [
      'hireDate', 'terminationDate', 'position', 'employmentType', 
      'salary', 'hourlyRate', 'managerId', 'employeeStatus', 
      'workStatus', 'jobGrade', 'location', 'emergencyContactName', 
      'emergencyContactPhone', 'employmentNotes'
    ];
    
    const employmentData: any = {};
    employmentFields.forEach(field => {
      if (data[field] !== undefined) {
        if (field === 'employmentNotes') {
          employmentData.notes = data[field]; // Map to 'notes' for DB
        } else {
          employmentData[field] = data[field];
        }
      }
    });
    
    return employmentData;
  }

  private mapToEntity(data: EmployeeJoinedData): Employee {
    return new Employee(data);
  }
}