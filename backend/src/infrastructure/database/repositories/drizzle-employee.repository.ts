import { injectable, inject } from 'inversify';
import { sql, eq } from 'drizzle-orm';
import { TYPES, DatabaseType } from '../../../shared/types';
import { Employee, EmployeeJoinedData } from '../../../domain/employee/entities/employee.entity';
import { EmployeeRepository } from '../../../domain/employee/repositories/employee.repository';
import { TypeNewEmployee, TypeUpdateEmployee } from '../../../../db/schema/employee.schema';
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
      WHERE people.id = ${id}
    `);

    return result.rows.length > 0 ? this.mapToEntity(result.rows[0] as EmployeeJoinedData) : null;
  }

  async create(employeeData: TypeNewEmployee): Promise<Employee> {
    // Create the person first
    const personResult = await this.db.execute(sql`
      INSERT INTO people (first_name, last_name, email, phone, birth_date, address, city, country, notes)
      VALUES (
        ${employeeData.firstName},
        ${employeeData.lastName},
        ${employeeData.email},
        ${employeeData.phone || null},
        ${employeeData.birthDate ? new Date(employeeData.birthDate) : null},
        ${employeeData.address || null},
        ${employeeData.city || null},
        ${employeeData.country || null},
        ${employeeData.personNotes || null}
      )
      RETURNING id
    `);

    const personId = personResult.rows[0].id;

    // Create the employment details
    await this.db.execute(sql`
      INSERT INTO employment_details (
        person_id, hire_date, position, employment_type, salary, hourly_rate, 
        manager_id, employee_status, work_status, job_grade, location,
        emergency_contact_name, emergency_contact_phone, notes
      )
      VALUES (
        ${personId},
        ${new Date(employeeData.hireDate)},
        ${employeeData.position},
        ${employeeData.employmentType || null},
        ${employeeData.salary || null},
        ${employeeData.hourlyRate || null},
        ${employeeData.managerId || null},
        ${employeeData.employeeStatus || 'Active'},
        ${employeeData.workStatus || 'Available'},
        ${employeeData.jobGrade || null},
        ${employeeData.location || null},
        ${employeeData.emergencyContactName || null},
        ${employeeData.emergencyContactPhone || null},
        ${employeeData.employmentNotes || null}
      )
    `);

    // Return the created employee
    const createdEmployee = await this.findById(personId as string);
    if (!createdEmployee) {
      throw new Error('Failed to retrieve created employee');
    }

    return createdEmployee;
  }

  async update(id: string, employeeData: TypeUpdateEmployee): Promise<Employee> {
    console.log('Updating employee with ID:', id);
    console.log('Update data:', employeeData);

    // Update person data if provided
    if (employeeData.firstName !== undefined || 
        employeeData.lastName !== undefined || 
        employeeData.email !== undefined ||
        employeeData.phone !== undefined ||
        employeeData.birthDate !== undefined ||
        employeeData.address !== undefined ||
        employeeData.city !== undefined ||
        employeeData.country !== undefined ||
        employeeData.personNotes !== undefined) {
      
      // Prepare person update data
      const personUpdateData: any = {};

      // Handle name updates and compute fullName
      if (employeeData.firstName !== undefined || employeeData.lastName !== undefined) {
        // Get current employee data for missing fields
        const currentEmployee = await this.findById(id);
        const firstName = employeeData.firstName ?? currentEmployee?.firstName;
        const lastName = employeeData.lastName ?? currentEmployee?.lastName;
        
        console.log(`Updating names: firstName="${firstName}", lastName="${lastName}"`);
        
        if (employeeData.firstName !== undefined) {
          personUpdateData.firstName = firstName;
        }
        if (employeeData.lastName !== undefined) {
          personUpdateData.lastName = lastName;
        }
      }

      if (employeeData.email !== undefined) {
        personUpdateData.email = employeeData.email;
      }
      if (employeeData.phone !== undefined) {
        personUpdateData.phone = employeeData.phone;
      }
      if (employeeData.birthDate !== undefined) {
        personUpdateData.birthDate = employeeData.birthDate ? new Date(employeeData.birthDate) : null;
      }
      if (employeeData.address !== undefined) {
        personUpdateData.address = employeeData.address;
      }
      if (employeeData.city !== undefined) {
        personUpdateData.city = employeeData.city;
      }
      if (employeeData.country !== undefined) {
        personUpdateData.country = employeeData.country;
      }
      if (employeeData.personNotes !== undefined) {
        personUpdateData.notes = employeeData.personNotes;
      }

      // Always update the updated_at timestamp
      personUpdateData.updatedAt = new Date();

      // Execute person update using Drizzle's update method
      console.log('Executing person update with data:', personUpdateData);
      await this.db.update(people).set(personUpdateData).where(eq(people.id, id));
    }

    // Update employment details if provided
    if (employeeData.hireDate !== undefined ||
        employeeData.terminationDate !== undefined ||
        employeeData.position !== undefined ||
        employeeData.employmentType !== undefined ||
        employeeData.salary !== undefined ||
        employeeData.hourlyRate !== undefined ||
        employeeData.managerId !== undefined ||
        employeeData.employeeStatus !== undefined ||
        employeeData.workStatus !== undefined ||
        employeeData.jobGrade !== undefined ||
        employeeData.location !== undefined ||
        employeeData.emergencyContactName !== undefined ||
        employeeData.emergencyContactPhone !== undefined ||
        employeeData.employmentNotes !== undefined) {

      // Prepare employment update data
      const employmentUpdateData: any = {};

      if (employeeData.hireDate !== undefined) {
        employmentUpdateData.hireDate = new Date(employeeData.hireDate);
      }
      if (employeeData.terminationDate !== undefined) {
        employmentUpdateData.terminationDate = employeeData.terminationDate ? new Date(employeeData.terminationDate) : null;
      }
      if (employeeData.position !== undefined) {
        employmentUpdateData.position = employeeData.position;
      }
      if (employeeData.employmentType !== undefined) {
        employmentUpdateData.employmentType = employeeData.employmentType;
      }
      if (employeeData.salary !== undefined) {
        employmentUpdateData.salary = employeeData.salary.toString();
      }
      if (employeeData.hourlyRate !== undefined) {
        employmentUpdateData.hourlyRate = employeeData.hourlyRate.toString();
      }
      if (employeeData.managerId !== undefined) {
        employmentUpdateData.managerId = employeeData.managerId;
      }
      if (employeeData.employeeStatus !== undefined) {
        employmentUpdateData.employeeStatus = employeeData.employeeStatus;
      }
      if (employeeData.workStatus !== undefined) {
        employmentUpdateData.workStatus = employeeData.workStatus;
      }
      if (employeeData.jobGrade !== undefined) {
        employmentUpdateData.jobGrade = employeeData.jobGrade;
      }
      if (employeeData.location !== undefined) {
        employmentUpdateData.location = employeeData.location;
      }
      if (employeeData.emergencyContactName !== undefined) {
        employmentUpdateData.emergencyContactName = employeeData.emergencyContactName;
      }
      if (employeeData.emergencyContactPhone !== undefined) {
        employmentUpdateData.emergencyContactPhone = employeeData.emergencyContactPhone;
      }
      if (employeeData.employmentNotes !== undefined) {
        employmentUpdateData.notes = employeeData.employmentNotes;
      }

      // Always update the updated_at timestamp
      employmentUpdateData.updatedAt = new Date();

      // Execute employment update using Drizzle's update method
      console.log('Executing employment update with data:', employmentUpdateData);
      await this.db.update(employmentDetails).set(employmentUpdateData).where(eq(employmentDetails.personId, id));
    }

    // Return the updated employee
    const updatedEmployee = await this.findById(id);
    if (!updatedEmployee) {
      throw new Error('Failed to retrieve updated employee');
    }

    console.log('Successfully updated employee');
    return updatedEmployee;
  }

  async delete(id: string): Promise<void> {
    console.log('Deleting employee with ID:', id);
    
    // Delete in correct order to avoid foreign key violations
    
    // 1. Delete employment details first
    await this.db.execute(sql`
      DELETE FROM employment_details WHERE person_id = ${id}
    `);
    console.log('Deleted employment details');

    // 2. Delete person status
    await this.db.execute(sql`
      DELETE FROM person_status WHERE person_id = ${id}
    `);
    console.log('Deleted person status');

    // 3. Delete any other related records that might reference this person
    // Delete person skills
    await this.db.execute(sql`
      DELETE FROM person_skills WHERE person_id = ${id}
    `);
    console.log('Deleted person skills');

    // Delete person technologies
    await this.db.execute(sql`
      DELETE FROM person_technologies WHERE person_id = ${id}
    `);
    console.log('Deleted person technologies');

    // Delete education records
    await this.db.execute(sql`
      DELETE FROM education WHERE person_id = ${id}
    `);
    console.log('Deleted education records');

    // Delete unavailable dates
    await this.db.execute(sql`
      DELETE FROM person_unavailable_dates WHERE person_id = ${id}
    `);
    console.log('Deleted unavailable dates');

    // Delete opportunity role assignments
    await this.db.execute(sql`
      DELETE FROM opportunity_role_assignments WHERE person_id = ${id}
    `);
    console.log('Deleted opportunity role assignments');

    // 4. Finally delete the person record
    await this.db.execute(sql`
      DELETE FROM people WHERE id = ${id}
    `);
    console.log('Deleted person record');
  }

  private mapToEntity(data: EmployeeJoinedData): Employee {
    return new Employee(data);
  }
}