import { injectable, inject } from 'inversify';
import { sql, eq } from 'drizzle-orm';
import { TYPES, DatabaseType } from '../../../shared/types';
import { Employee, EmployeeJoinedData, EmployeeSkill, EmployeeTechnology, EmployeeEducation } from '../../../domain/employee/entities/employee.entity';
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

// Types for CRUD operations on related entities
export type CreateEmployeeSkillData = {
  skillName: string;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
  lastUsed?: Date;
  isCertified?: boolean;
  certificationName?: string;
  certificationDate?: Date;
  notes?: string;
};

export type CreateEmployeeTechnologyData = {
  technologyName: string;
  proficiencyLevel?: string;
  yearsOfExperience?: string;
  lastUsed?: Date;
  context?: string;
  projectName?: string;
  description?: string;
};

export type CreateEmployeeEducationData = {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  graduationDate?: Date;
  description?: string;
  gpa?: string;
  isCurrentlyEnrolled?: string;
};

@injectable()
export class DrizzleEmployeeRepository implements EmployeeRepository {
  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) {}

  async findAll(includeRelated: boolean = true): Promise<Employee[]> {
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

    const employees = result.rows.map((row) => this.mapToEntity(row as EmployeeJoinedData));

    if (includeRelated) {
      // Load related entities for all employees
      for (const employee of employees) {
        await this.loadRelatedEntities(employee);
      }
    }

    return employees;
  }

  async findById(id: string, includeRelated: boolean = true): Promise<Employee | null> {
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

    if (queryResult.rows.length === 0) {
      return null;
    }

    const employee = this.mapToEntity(queryResult.rows[0] as EmployeeJoinedData);

    if (includeRelated) {
      await this.loadRelatedEntities(employee);
    }

    return employee;
  }

  private async loadRelatedEntities(employee: Employee): Promise<void> {
    // Load skills with related skill information
    const skillsResult = await this.db.execute(sql`
      SELECT 
        ps.skill_id as "skillId",
        s.name as "skillName",
        s.category as "skillCategory",
        s.description as "skillDescription",
        ps.proficiency_level as "proficiencyLevel",
        ps.years_of_experience as "yearsOfExperience",
        ps.last_used as "lastUsed",
        ps.is_certified as "isCertified",
        ps.certification_name as "certificationName",
        ps.certification_date as "certificationDate",
        ps.notes as "notes",
        ps.created_at as "createdAt",
        ps.updated_at as "updatedAt"
      FROM person_skills ps
      INNER JOIN skills s ON ps.skill_id = s.id
      WHERE ps.person_id = ${employee.id}
      ORDER BY s.name
    `);

    employee.skills = skillsResult.rows.map(row => ({
      skillId: row.skillId,
      skillName: row.skillName,
      skillCategory: row.skillCategory,
      skillDescription: row.skillDescription,
      proficiencyLevel: row.proficiencyLevel,
      yearsOfExperience: row.yearsOfExperience,
      lastUsed: row.lastUsed,
      isCertified: row.isCertified,
      certificationName: row.certificationName,
      certificationDate: row.certificationDate,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })) as EmployeeSkill[];

    // Load technologies with related technology information
    const technologiesResult = await this.db.execute(sql`
      SELECT 
        pt.technology_id as "technologyId",
        t.name as "technologyName",
        t.category as "technologyCategory",
        t.description as "technologyDescription",
        t.version as "technologyVersion",
        pt.proficiency_level as "proficiencyLevel",
        pt.years_of_experience as "yearsOfExperience",
        pt.last_used as "lastUsed",
        pt.context as "context",
        pt.project_name as "projectName",
        pt.description as "description",
        pt.created_at as "createdAt",
        pt.updated_at as "updatedAt"
      FROM person_technologies pt
      INNER JOIN technologies t ON pt.technology_id = t.id
      WHERE pt.person_id = ${employee.id}
      ORDER BY t.name
    `);

    employee.technologies = technologiesResult.rows.map(row => ({
      technologyId: row.technologyId,
      technologyName: row.technologyName,
      technologyCategory: row.technologyCategory,
      technologyDescription: row.technologyDescription,
      technologyVersion: row.technologyVersion,
      proficiencyLevel: row.proficiencyLevel,
      yearsOfExperience: row.yearsOfExperience,
      lastUsed: row.lastUsed,
      context: row.context,
      projectName: row.projectName,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })) as EmployeeTechnology[];

    // Load education
    const educationResult = await this.db.execute(sql`
      SELECT 
        id,
        institution,
        degree,
        field_of_study as "fieldOfStudy",
        start_date as "startDate",
        graduation_date as "graduationDate",
        description,
        gpa,
        is_currently_enrolled as "isCurrentlyEnrolled",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM education
      WHERE person_id = ${employee.id}
      ORDER BY start_date DESC
    `);

    employee.education = educationResult.rows.map(row => ({
      id: row.id,
      institution: row.institution,
      degree: row.degree,
      fieldOfStudy: row.fieldOfStudy,
      startDate: row.startDate,
      graduationDate: row.graduationDate,
      description: row.description,
      gpa: row.gpa,
      isCurrentlyEnrolled: row.isCurrentlyEnrolled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })) as EmployeeEducation[];
  }

  async create(employeeData: TypeNewEmployee): Promise<Employee> {
    // Validate and transform with Zod
    const result = CreateEmployeeSchema.safeParse(employeeData);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
    }
    const validatedData = result.data;

    return await this.db.transaction(async (tx) => {
      // Generate fullName for the person
      const fullName = `${validatedData.firstName} ${validatedData.lastName}`;

      // Create person record - Zod has already transformed all the data
      const personResult = await tx.execute(sql`
        INSERT INTO people (first_name, last_name, full_name, email, phone, birth_date, address, city, country, notes)
        VALUES (
          ${validatedData.firstName},
          ${validatedData.lastName},
          ${fullName},
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

  // CRUD operations for Skills
  async addSkillToEmployee(employeeId: string, skillData: CreateEmployeeSkillData): Promise<void> {
    // Validate employee ID
    const employeeIdResult = EmployeeIdSchema.safeParse(employeeId);
    if (!employeeIdResult.success) {
      throw new Error(`Invalid employee ID: ${employeeIdResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Look up skill by name, or create it if it doesn't exist
    let skillLookupResult = await this.db.execute(sql`
      SELECT id FROM skills WHERE LOWER(name) = LOWER(${skillData.skillName})
    `);
    
    let skillId: string;
    
    if (skillLookupResult.rows.length === 0) {
      // Skill doesn't exist, create it automatically
      const createSkillResult = await this.db.execute(sql`
        INSERT INTO skills (id, name, category, description)
        VALUES (gen_random_uuid(), ${skillData.skillName}, 'General', 'Auto-created skill')
        RETURNING id
      `);
      skillId = createSkillResult.rows[0].id as string;
    } else {
      skillId = skillLookupResult.rows[0].id as string;
    }

    // Check if employee already has this skill
    const existingSkillResult = await this.db.execute(sql`
      SELECT * FROM person_skills 
      WHERE person_id = ${employeeIdResult.data} AND skill_id = ${skillId}
    `);

    if (existingSkillResult.rows.length > 0) {
      throw new Error(`Employee already has the skill '${skillData.skillName}'. Use update instead of add.`);
    }

    // Add the skill to the employee
    await this.db.execute(sql`
      INSERT INTO person_skills (
        person_id, skill_id, proficiency_level, years_of_experience, 
        last_used, is_certified, certification_name, certification_date, notes
      )
      VALUES (
        ${employeeIdResult.data},
        ${skillId},
        ${skillData.proficiencyLevel || null},
        ${skillData.yearsOfExperience || null},
        ${skillData.lastUsed || null},
        ${skillData.isCertified || false},
        ${skillData.certificationName || null},
        ${skillData.certificationDate || null},
        ${skillData.notes || null}
      )
    `);
  }

  async updateEmployeeSkill(employeeId: string, skillIdentifier: string, skillData: Partial<CreateEmployeeSkillData>): Promise<void> {
    const idResult = EmployeeIdSchema.safeParse(employeeId);
    if (!idResult.success) {
      throw new Error(`Invalid employee ID: ${idResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Look up skill by name or ID
    let skillId: string;
    
    // First, try to find by name (more user-friendly)
    const skillByNameResult = await this.db.execute(sql`
      SELECT id FROM skills WHERE LOWER(name) = LOWER(${skillIdentifier})
    `);
    
    if (skillByNameResult.rows.length > 0) {
      skillId = skillByNameResult.rows[0].id as string;
    } else {
      // If not found by name, try by ID (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(skillIdentifier)) {
        const skillByIdResult = await this.db.execute(sql`
          SELECT id FROM skills WHERE id = ${skillIdentifier}
        `);
        
        if (skillByIdResult.rows.length > 0) {
          skillId = skillIdentifier;
        } else {
          throw new Error(`Skill with ID '${skillIdentifier}' does not exist`);
        }
      } else {
        throw new Error(`Skill '${skillIdentifier}' does not exist`);
      }
    }

    // Verify the employee has this skill
    const existingSkillResult = await this.db.execute(sql`
      SELECT * FROM person_skills 
      WHERE person_id = ${idResult.data} AND skill_id = ${skillId}
    `);

    if (existingSkillResult.rows.length === 0) {
      throw new Error(`Employee does not have the skill '${skillIdentifier}'`);
    }

    const updateParts: any[] = [];
    
    if (skillData.proficiencyLevel !== undefined) {
      updateParts.push(sql`proficiency_level = ${skillData.proficiencyLevel}`);
    }
    if (skillData.yearsOfExperience !== undefined) {
      updateParts.push(sql`years_of_experience = ${skillData.yearsOfExperience}`);
    }
    if (skillData.lastUsed !== undefined) {
      updateParts.push(sql`last_used = ${skillData.lastUsed}`);
    }
    if (skillData.isCertified !== undefined) {
      updateParts.push(sql`is_certified = ${skillData.isCertified}`);
    }
    if (skillData.certificationName !== undefined) {
      updateParts.push(sql`certification_name = ${skillData.certificationName}`);
    }
    if (skillData.certificationDate !== undefined) {
      updateParts.push(sql`certification_date = ${skillData.certificationDate}`);
    }
    if (skillData.notes !== undefined) {
      updateParts.push(sql`notes = ${skillData.notes}`);
    }

    if (updateParts.length > 0) {
      updateParts.push(sql`updated_at = NOW()`);
      
      await this.db.execute(sql`
        UPDATE person_skills 
        SET ${sql.join(updateParts, sql`, `)}
        WHERE person_id = ${idResult.data} AND skill_id = ${skillId}
      `);
    }
  }

  async removeSkillFromEmployee(employeeId: string, skillIdentifier: string): Promise<void> {
    const idResult = EmployeeIdSchema.safeParse(employeeId);
    if (!idResult.success) {
      throw new Error(`Invalid employee ID: ${idResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Look up skill by name or ID
    let skillId: string;
    
    // First, try to find by name (more user-friendly)
    const skillByNameResult = await this.db.execute(sql`
      SELECT id FROM skills WHERE LOWER(name) = LOWER(${skillIdentifier})
    `);
    
    if (skillByNameResult.rows.length > 0) {
      skillId = skillByNameResult.rows[0].id as string;
    } else {
      // If not found by name, try by ID (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(skillIdentifier)) {
        const skillByIdResult = await this.db.execute(sql`
          SELECT id FROM skills WHERE id = ${skillIdentifier}
        `);
        
        if (skillByIdResult.rows.length > 0) {
          skillId = skillIdentifier;
        } else {
          throw new Error(`Skill with ID '${skillIdentifier}' does not exist`);
        }
      } else {
        throw new Error(`Skill '${skillIdentifier}' does not exist`);
      }
    }

    await this.db.execute(sql`
      DELETE FROM person_skills 
      WHERE person_id = ${idResult.data} AND skill_id = ${skillId}
    `);
  }

  // CRUD operations for Technologies
  async addTechnologyToEmployee(employeeId: string, technologyData: CreateEmployeeTechnologyData): Promise<void> {
    // Validate employee ID
    const employeeIdResult = EmployeeIdSchema.safeParse(employeeId);
    if (!employeeIdResult.success) {
      throw new Error(`Invalid employee ID: ${employeeIdResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Look up technology by name, or create it if it doesn't exist
    let technologyLookupResult = await this.db.execute(sql`
      SELECT id FROM technologies WHERE LOWER(name) = LOWER(${technologyData.technologyName})
    `);
    
    let technologyId: string;
    
    if (technologyLookupResult.rows.length === 0) {
      // Technology doesn't exist, create it automatically
      const createTechnologyResult = await this.db.execute(sql`
        INSERT INTO technologies (id, name, category, description)
        VALUES (gen_random_uuid(), ${technologyData.technologyName}, 'General', 'Auto-created technology')
        RETURNING id
      `);
      technologyId = createTechnologyResult.rows[0].id as string;
    } else {
      technologyId = technologyLookupResult.rows[0].id as string;
    }

    // Check if employee already has this technology
    const existingTechnologyResult = await this.db.execute(sql`
      SELECT * FROM person_technologies 
      WHERE person_id = ${employeeIdResult.data} AND technology_id = ${technologyId}
    `);

    if (existingTechnologyResult.rows.length > 0) {
      throw new Error(`Employee already has the technology '${technologyData.technologyName}'. Use update instead of add.`);
    }

    // Add the technology to the employee
    await this.db.execute(sql`
      INSERT INTO person_technologies (
        person_id, technology_id, proficiency_level, years_of_experience, 
        last_used, context, project_name, description
      )
      VALUES (
        ${employeeIdResult.data},
        ${technologyId},
        ${technologyData.proficiencyLevel || null},
        ${technologyData.yearsOfExperience || null},
        ${technologyData.lastUsed || null},
        ${technologyData.context || null},
        ${technologyData.projectName || null},
        ${technologyData.description || null}
      )
    `);
  }

  async updateEmployeeTechnology(employeeId: string, technologyIdentifier: string, technologyData: Partial<CreateEmployeeTechnologyData>): Promise<void> {
    const idResult = EmployeeIdSchema.safeParse(employeeId);
    if (!idResult.success) {
      throw new Error(`Invalid employee ID: ${idResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Look up technology by name or ID
    let technologyId: string;
    
    // First, try to find by name (more user-friendly)
    const technologyByNameResult = await this.db.execute(sql`
      SELECT id FROM technologies WHERE LOWER(name) = LOWER(${technologyIdentifier})
    `);
    
    if (technologyByNameResult.rows.length > 0) {
      technologyId = technologyByNameResult.rows[0].id as string;
    } else {
      // If not found by name, try by ID (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(technologyIdentifier)) {
        const technologyByIdResult = await this.db.execute(sql`
          SELECT id FROM technologies WHERE id = ${technologyIdentifier}
        `);
        
        if (technologyByIdResult.rows.length > 0) {
          technologyId = technologyIdentifier;
        } else {
          throw new Error(`Technology with ID '${technologyIdentifier}' does not exist`);
        }
      } else {
        throw new Error(`Technology '${technologyIdentifier}' does not exist`);
      }
    }

    // Verify the employee has this technology
    const existingTechnologyResult = await this.db.execute(sql`
      SELECT * FROM person_technologies 
      WHERE person_id = ${idResult.data} AND technology_id = ${technologyId}
    `);

    if (existingTechnologyResult.rows.length === 0) {
      throw new Error(`Employee does not have the technology '${technologyIdentifier}'`);
    }

    const updateParts: any[] = [];
    
    if (technologyData.proficiencyLevel !== undefined) {
      updateParts.push(sql`proficiency_level = ${technologyData.proficiencyLevel}`);
    }
    if (technologyData.yearsOfExperience !== undefined) {
      updateParts.push(sql`years_of_experience = ${technologyData.yearsOfExperience}`);
    }
    if (technologyData.lastUsed !== undefined) {
      updateParts.push(sql`last_used = ${technologyData.lastUsed}`);
    }
    if (technologyData.context !== undefined) {
      updateParts.push(sql`context = ${technologyData.context}`);
    }
    if (technologyData.projectName !== undefined) {
      updateParts.push(sql`project_name = ${technologyData.projectName}`);
    }
    if (technologyData.description !== undefined) {
      updateParts.push(sql`description = ${technologyData.description}`);
    }

    if (updateParts.length > 0) {
      updateParts.push(sql`updated_at = NOW()`);
      
      await this.db.execute(sql`
        UPDATE person_technologies 
        SET ${sql.join(updateParts, sql`, `)}
        WHERE person_id = ${idResult.data} AND technology_id = ${technologyId}
      `);
    }
  }

  async removeTechnologyFromEmployee(employeeId: string, technologyIdentifier: string): Promise<void> {
    const idResult = EmployeeIdSchema.safeParse(employeeId);
    if (!idResult.success) {
      throw new Error(`Invalid employee ID: ${idResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Look up technology by name or ID
    let technologyId: string;
    
    // First, try to find by name (more user-friendly)
    const technologyByNameResult = await this.db.execute(sql`
      SELECT id FROM technologies WHERE LOWER(name) = LOWER(${technologyIdentifier})
    `);
    
    if (technologyByNameResult.rows.length > 0) {
      technologyId = technologyByNameResult.rows[0].id as string;
    } else {
      // If not found by name, try by ID (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(technologyIdentifier)) {
        const technologyByIdResult = await this.db.execute(sql`
          SELECT id FROM technologies WHERE id = ${technologyIdentifier}
        `);
        
        if (technologyByIdResult.rows.length > 0) {
          technologyId = technologyIdentifier;
        } else {
          throw new Error(`Technology with ID '${technologyIdentifier}' does not exist`);
        }
      } else {
        throw new Error(`Technology '${technologyIdentifier}' does not exist`);
      }
    }

    await this.db.execute(sql`
      DELETE FROM person_technologies 
      WHERE person_id = ${idResult.data} AND technology_id = ${technologyId}
    `);
  }

  // CRUD operations for Education
  async addEducationToEmployee(employeeId: string, educationData: CreateEmployeeEducationData): Promise<string> {
    const idResult = EmployeeIdSchema.safeParse(employeeId);
    if (!idResult.success) {
      throw new Error(`Invalid employee ID: ${idResult.error.issues.map(i => i.message).join(', ')}`);
    }

    const result = await this.db.execute(sql`
      INSERT INTO education (
        person_id, institution, degree, field_of_study, start_date, 
        graduation_date, description, gpa, is_currently_enrolled
      )
      VALUES (
        ${idResult.data},
        ${educationData.institution},
        ${educationData.degree || null},
        ${educationData.fieldOfStudy || null},
        ${educationData.startDate || null},
        ${educationData.graduationDate || null},
        ${educationData.description || null},
        ${educationData.gpa || null},
        ${educationData.isCurrentlyEnrolled || 'false'}
      )
      RETURNING id
    `);

    return result.rows[0].id as string;
  }

  async updateEmployeeEducation(educationId: string, educationData: Partial<CreateEmployeeEducationData>): Promise<void> {
    const updateParts: any[] = [];
    
    if (educationData.institution !== undefined) {
      updateParts.push(sql`institution = ${educationData.institution}`);
    }
    if (educationData.degree !== undefined) {
      updateParts.push(sql`degree = ${educationData.degree}`);
    }
    if (educationData.fieldOfStudy !== undefined) {
      updateParts.push(sql`field_of_study = ${educationData.fieldOfStudy}`);
    }
    if (educationData.startDate !== undefined) {
      updateParts.push(sql`start_date = ${educationData.startDate}`);
    }
    if (educationData.graduationDate !== undefined) {
      updateParts.push(sql`graduation_date = ${educationData.graduationDate}`);
    }
    if (educationData.description !== undefined) {
      updateParts.push(sql`description = ${educationData.description}`);
    }
    if (educationData.gpa !== undefined) {
      updateParts.push(sql`gpa = ${educationData.gpa}`);
    }
    if (educationData.isCurrentlyEnrolled !== undefined) {
      updateParts.push(sql`is_currently_enrolled = ${educationData.isCurrentlyEnrolled}`);
    }

    if (updateParts.length > 0) {
      updateParts.push(sql`updated_at = NOW()`);
      
      await this.db.execute(sql`
        UPDATE education 
        SET ${sql.join(updateParts, sql`, `)}
        WHERE id = ${educationId}
      `);
    }
  }

  async removeEducationFromEmployee(educationId: string): Promise<void> {
    await this.db.execute(sql`
      DELETE FROM education WHERE id = ${educationId}
    `);
  }

  // Search methods for RAG functionality
  async searchEmployeesBySkills(skillNames: string[]): Promise<Employee[]> {
    if (skillNames.length === 0) return [];

    const result = await this.db.execute(sql`
      SELECT DISTINCT p.id
      FROM people p
      INNER JOIN employment_details ed ON p.id = ed.person_id
      INNER JOIN person_skills ps ON p.id = ps.person_id
      INNER JOIN skills s ON ps.skill_id = s.id
      WHERE LOWER(s.name) IN (${sql.raw(skillNames.map(name => `'${name.toLowerCase()}'`).join(','))})
      AND ed.id IS NOT NULL
    `);

    const employeeIds = result.rows.map(row => row.id as string);
    if (employeeIds.length === 0) return [];

    const employees = await Promise.all(
      employeeIds.map(id => this.findById(id, true))
    );

    return employees.filter(emp => emp !== null) as Employee[];
  }

  async searchEmployeesByTechnologies(technologyNames: string[]): Promise<Employee[]> {
    if (technologyNames.length === 0) return [];

    const result = await this.db.execute(sql`
      SELECT DISTINCT p.id
      FROM people p
      INNER JOIN employment_details ed ON p.id = ed.person_id
      INNER JOIN person_technologies pt ON p.id = pt.person_id
      INNER JOIN technologies t ON pt.technology_id = t.id
      WHERE LOWER(t.name) IN (${sql.raw(technologyNames.map(name => `'${name.toLowerCase()}'`).join(','))})
      AND ed.id IS NOT NULL
    `);

    const employeeIds = result.rows.map(row => row.id as string);
    if (employeeIds.length === 0) return [];

    const employees = await Promise.all(
      employeeIds.map(id => this.findById(id, true))
    );

    return employees.filter(emp => emp !== null) as Employee[];
  }

  async searchEmployeesByEducation(institution?: string, degree?: string, fieldOfStudy?: string): Promise<Employee[]> {
    let whereConditions: string[] = [];
    
    if (institution) {
      whereConditions.push(`LOWER(e.institution) LIKE '%${institution.toLowerCase()}%'`);
    }
    if (degree) {
      whereConditions.push(`LOWER(e.degree) LIKE '%${degree.toLowerCase()}%'`);
    }
    if (fieldOfStudy) {
      whereConditions.push(`LOWER(e.field_of_study) LIKE '%${fieldOfStudy.toLowerCase()}%'`);
    }

    if (whereConditions.length === 0) return [];

    const result = await this.db.execute(sql`
      SELECT DISTINCT p.id
      FROM people p
      INNER JOIN employment_details ed ON p.id = ed.person_id
      INNER JOIN education e ON p.id = e.person_id
      WHERE ${sql.raw(whereConditions.join(' AND '))}
      AND ed.id IS NOT NULL
    `);

    const employeeIds = result.rows.map(row => row.id as string);
    if (employeeIds.length === 0) return [];

    const employees = await Promise.all(
      employeeIds.map(id => this.findById(id, true))
    );

    return employees.filter(emp => emp !== null) as Employee[];
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