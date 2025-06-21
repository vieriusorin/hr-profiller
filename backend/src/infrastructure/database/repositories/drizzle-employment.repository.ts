import { injectable, inject } from 'inversify';
import { sql } from 'drizzle-orm';
import { TYPES, DatabaseType } from '../../../shared/types';
import { Employment, EmploymentData } from '../../../domain/employee/entities/employment.entity';
import { EmploymentRepository, CreateEmploymentData } from '../../../domain/employee/repositories/employment.repository';
import { TypeEmploymentDetails } from '../../../../db/schema/employment-details.schema';

@injectable()
export class DrizzleEmploymentRepository implements EmploymentRepository {
  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) { }

  // Core CRUD operations for Employment
  async findAll(): Promise<Employment[]> {
    const result = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      ORDER BY employment_details.hire_date DESC
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmploymentData));
  }

  async findById(id: string): Promise<Employment | null> {
    const queryResult = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      WHERE employment_details.id = ${id}
    `);

    if (queryResult.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(queryResult.rows[0] as EmploymentData);
  }

  async findByPersonId(personId: string): Promise<Employment[]> {
    const result = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      WHERE employment_details.person_id = ${personId}
      ORDER BY employment_details.hire_date DESC
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmploymentData));
  }

  async findActiveByPersonId(personId: string): Promise<Employment | null> {
    const queryResult = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      WHERE employment_details.person_id = ${personId}
        AND employment_details.termination_date IS NULL
        AND employment_details.employee_status = 'Active'
      ORDER BY employment_details.hire_date DESC
      LIMIT 1
    `);

    if (queryResult.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(queryResult.rows[0] as EmploymentData);
  }

  async create(employmentData: CreateEmploymentData): Promise<Employment> {
    const result = await this.db.execute(sql`
      INSERT INTO employment_details (
        person_id, position, location, salary, hourly_rate, employment_type,
        hire_date, termination_date, work_status, employee_status, manager_id, notes
      )
      VALUES (
        ${employmentData.personId},
        ${employmentData.position},
        ${employmentData.location || null},
        ${employmentData.salary || null},
        ${employmentData.hourlyRate || null},
        ${employmentData.employmentType || null},
        ${employmentData.hireDate || new Date()},
        ${employmentData.terminationDate || null},
        ${employmentData.workStatus || 'Available'},
        ${employmentData.employeeStatus || 'Active'},
        ${employmentData.managerId || null},
        ${employmentData.notes || null}
      )
      RETURNING id
    `);

    const employmentId = result.rows[0].id as string;
    const createdEmployment = await this.findById(employmentId);

    if (!createdEmployment) {
      throw new Error('Failed to retrieve created employment record');
    }

    return createdEmployment;
  }

  async update(id: string, employmentData: Partial<TypeEmploymentDetails>): Promise<Employment> {
    const updateParts: any[] = [];

    if (employmentData.position !== undefined) {
      updateParts.push(sql`position = ${employmentData.position}`);
    }
    if (employmentData.location !== undefined) {
      updateParts.push(sql`location = ${employmentData.location}`);
    }
    if (employmentData.salary !== undefined) {
      updateParts.push(sql`salary = ${employmentData.salary}`);
    }
    if (employmentData.hourlyRate !== undefined) {
      updateParts.push(sql`hourly_rate = ${employmentData.hourlyRate}`);
    }
    if (employmentData.employmentType !== undefined) {
      updateParts.push(sql`employment_type = ${employmentData.employmentType}`);
    }
    if (employmentData.hireDate !== undefined) {
      updateParts.push(sql`hire_date = ${employmentData.hireDate}`);
    }
    if (employmentData.terminationDate !== undefined) {
      updateParts.push(sql`termination_date = ${employmentData.terminationDate}`);
    }
    if (employmentData.workStatus !== undefined) {
      updateParts.push(sql`work_status = ${employmentData.workStatus}`);
    }
    if (employmentData.employeeStatus !== undefined) {
      updateParts.push(sql`employee_status = ${employmentData.employeeStatus}`);
    }
    if (employmentData.managerId !== undefined) {
      updateParts.push(sql`manager_id = ${employmentData.managerId}`);
    }
    if (employmentData.jobGrade !== undefined) {
      updateParts.push(sql`job_grade = ${employmentData.jobGrade}`);
    }
    if (employmentData.emergencyContactName !== undefined) {
      updateParts.push(sql`emergency_contact_name = ${employmentData.emergencyContactName}`);
    }
    if (employmentData.emergencyContactPhone !== undefined) {
      updateParts.push(sql`emergency_contact_phone = ${employmentData.emergencyContactPhone}`);
    }
    if (employmentData.notes !== undefined) {
      updateParts.push(sql`notes = ${employmentData.notes}`);
    }

    if (updateParts.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    updateParts.push(sql`updated_at = NOW()`);

    await this.db.execute(sql`
      UPDATE employment_details 
      SET ${sql.join(updateParts, sql`, `)}
      WHERE id = ${id}
    `);

    const updatedEmployment = await this.findById(id);
    if (!updatedEmployment) {
      throw new Error('Failed to retrieve updated employment record');
    }

    return updatedEmployment;
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(sql`DELETE FROM employment_details WHERE id = ${id}`);
  }

  // Employment-specific operations
  async findByManager(managerId: string): Promise<Employment[]> {
    const result = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      WHERE employment_details.manager_id = ${managerId}
      ORDER BY employment_details.hire_date DESC
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmploymentData));
  }

  async findByLocation(location: string): Promise<Employment[]> {
    const result = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      WHERE LOWER(employment_details.location) = LOWER(${location})
      ORDER BY employment_details.hire_date DESC
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmploymentData));
  }

  async findByWorkStatus(workStatus: string): Promise<Employment[]> {
    const result = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      WHERE employment_details.work_status = ${workStatus}
      ORDER BY employment_details.hire_date DESC
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmploymentData));
  }

  async findByEmployeeStatus(employeeStatus: string): Promise<Employment[]> {
    const result = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      WHERE employment_details.employee_status = ${employeeStatus}
      ORDER BY employment_details.hire_date DESC
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmploymentData));
  }

  // Employment relationship operations
  async assignManager(employmentId: string, managerId: string): Promise<void> {
    await this.db.execute(sql`
      UPDATE employment_details 
      SET manager_id = ${managerId}, updated_at = NOW()
      WHERE id = ${employmentId}
    `);
  }

  async removeManager(employmentId: string): Promise<void> {
    await this.db.execute(sql`
      UPDATE employment_details 
      SET manager_id = NULL, updated_at = NOW()
      WHERE id = ${employmentId}
    `);
  }

  async promoteEmployee(employmentId: string, newPosition: string, newSalary?: number): Promise<Employment> {
    const updateParts = [
      sql`position = ${newPosition}`,
      sql`updated_at = NOW()`
    ];

    if (newSalary !== undefined) {
      updateParts.splice(-1, 0, sql`salary = ${newSalary}`);
    }

    await this.db.execute(sql`
      UPDATE employment_details 
      SET ${sql.join(updateParts, sql`, `)}
      WHERE id = ${employmentId}
    `);

    const updatedEmployment = await this.findById(employmentId);
    if (!updatedEmployment) {
      throw new Error('Failed to retrieve updated employment record after promotion');
    }

    return updatedEmployment;
  }

  async terminateEmployment(employmentId: string, endDate: Date, notes?: string): Promise<Employment> {
    const updateParts = [
      sql`termination_date = ${endDate}`,
      sql`employee_status = 'Inactive'`,
      sql`updated_at = NOW()`
    ];

    if (notes) {
      const currentEmployment = await this.findById(employmentId);
      const combinedNotes = currentEmployment?.notes
        ? `${currentEmployment.notes}\n\nTermination: ${notes}`
        : `Termination: ${notes}`;
      updateParts.splice(-1, 0, sql`notes = ${combinedNotes}`);
    }

    await this.db.execute(sql`
      UPDATE employment_details 
      SET ${sql.join(updateParts, sql`, `)}
      WHERE id = ${employmentId}
    `);

    const updatedEmployment = await this.findById(employmentId);
    if (!updatedEmployment) {
      throw new Error('Failed to retrieve updated employment record after termination');
    }

    return updatedEmployment;
  }

  // Search and filtering
  async searchByText(searchText: string): Promise<Employment[]> {
    const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.length > 0);
    if (searchTerms.length === 0) return [];

    const result = await this.db.execute(sql`
      SELECT DISTINCT
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      WHERE 
        LOWER(employment_details.position) LIKE '%${searchTerms[0]}%' OR
        LOWER(employment_details.location) LIKE '%${searchTerms[0]}%' OR
        LOWER(employment_details.employment_type) LIKE '%${searchTerms[0]}%' OR
        LOWER(employment_details.employee_status) LIKE '%${searchTerms[0]}%' OR
        LOWER(employment_details.work_status) LIKE '%${searchTerms[0]}%' OR
        LOWER(employment_details.notes) LIKE '%${searchTerms[0]}%'
      ORDER BY employment_details.hire_date DESC
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmploymentData));
  }

  async findByDateRange(startDate?: Date, endDate?: Date): Promise<Employment[]> {
    let whereClause = '';

    if (startDate && endDate) {
      whereClause = `WHERE employment_details.hire_date >= '${startDate.toISOString()}' AND employment_details.hire_date <= '${endDate.toISOString()}'`;
    } else if (startDate) {
      whereClause = `WHERE employment_details.hire_date >= '${startDate.toISOString()}'`;
    } else if (endDate) {
      whereClause = `WHERE employment_details.hire_date <= '${endDate.toISOString()}'`;
    }

    const result = await this.db.execute(sql`
      SELECT 
        employment_details.id as "id",
        employment_details.person_id as "personId",
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
        employment_details.notes as "notes",
        employment_details.created_at as "createdAt",
        employment_details.updated_at as "updatedAt"
      FROM employment_details
      ${sql.raw(whereClause)}
      ORDER BY employment_details.hire_date DESC
    `);

    return result.rows.map((row) => this.mapToEntity(row as EmploymentData));
  }

  // Private helper methods
  private mapToEntity(data: EmploymentData): Employment {
    return new Employment(data);
  }
} 