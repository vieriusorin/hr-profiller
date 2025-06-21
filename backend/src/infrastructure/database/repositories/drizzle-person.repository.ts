import { injectable, inject } from 'inversify';
import { sql } from 'drizzle-orm';
import { TYPES, DatabaseType } from '../../../shared/types';
import { Person, PersonData } from '../../../domain/person/entities/person.entity';
import { PersonRepository, CreatePersonSkillData, CreatePersonTechnologyData, CreatePersonEducationData } from '../../../domain/person/repositories/person.repository';
import { TypeNewPerson, TypePerson } from '../../../../db/schema/people.schema';

@injectable()
export class DrizzlePersonRepository implements PersonRepository {
  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) { }

  // Core CRUD operations for Person
  async findAll(includeCapabilities: boolean = true): Promise<Person[]> {
    const result = await this.db.execute(sql`
      SELECT 
        people.id as "id",
        people.first_name as "firstName",
        people.last_name as "lastName",
        people.full_name as "fullName",
        people.email as "email",
        people.phone as "phone",
        people.birth_date as "birthDate",
        people.address as "address",
        people.city as "city",
        people.country as "country",
        people.notes as "notes",
        people.created_at as "createdAt",
        people.updated_at as "updatedAt"
      FROM people
      ORDER BY people.last_name, people.first_name
    `);

    const persons = result.rows.map((row) => this.mapToEntity(row as PersonData));

    if (includeCapabilities) {
      // Load capabilities for all persons
      for (const person of persons) {
        await this.loadCapabilities(person);
      }
    }

    return persons;
  }

  async findById(id: string, includeCapabilities: boolean = true): Promise<Person | null> {
    const queryResult = await this.db.execute(sql`
      SELECT 
        people.id as "id",
        people.first_name as "firstName",
        people.last_name as "lastName",
        people.full_name as "fullName",
        people.email as "email",
        people.phone as "phone",
        people.birth_date as "birthDate",
        people.address as "address",
        people.city as "city",
        people.country as "country",
        people.notes as "notes",
        people.created_at as "createdAt",
        people.updated_at as "updatedAt"
      FROM people
      WHERE people.id = ${id}
    `);

    if (queryResult.rows.length === 0) {
      return null;
    }

    const person = this.mapToEntity(queryResult.rows[0] as PersonData);

    if (includeCapabilities) {
      await this.loadCapabilities(person);
    }

    return person;
  }

  async findByEmail(email: string, includeCapabilities: boolean = true): Promise<Person | null> {
    const queryResult = await this.db.execute(sql`
      SELECT 
        people.id as "id",
        people.first_name as "firstName",
        people.last_name as "lastName",
        people.full_name as "fullName",
        people.email as "email",
        people.phone as "phone",
        people.birth_date as "birthDate",
        people.address as "address",
        people.city as "city",
        people.country as "country",
        people.notes as "notes",
        people.created_at as "createdAt",
        people.updated_at as "updatedAt"
      FROM people
      WHERE LOWER(people.email) = LOWER(${email})
    `);

    if (queryResult.rows.length === 0) {
      return null;
    }

    const person = this.mapToEntity(queryResult.rows[0] as PersonData);

    if (includeCapabilities) {
      await this.loadCapabilities(person);
    }

    return person;
  }

  async create(personData: TypeNewPerson): Promise<Person> {
    const result = await this.db.execute(sql`
      INSERT INTO people (
        first_name, last_name, full_name, email, phone, birth_date, 
        address, city, country, notes
      )
      VALUES (
        ${personData.firstName},
        ${personData.lastName},
        ${personData.fullName || `${personData.firstName} ${personData.lastName}`},
        ${personData.email},
        ${personData.phone || null},
        ${personData.birthDate || null},
        ${personData.address || null},
        ${personData.city || null},
        ${personData.country || null},
        ${personData.notes || null}
      )
      RETURNING id
    `);

    const personId = result.rows[0].id as string;
    const createdPerson = await this.findById(personId, false);

    if (!createdPerson) {
      throw new Error('Failed to retrieve created person');
    }

    return createdPerson;
  }

  async update(id: string, personData: Partial<TypePerson>): Promise<Person> {
    const updateParts: any[] = [];

    if (personData.firstName !== undefined) {
      updateParts.push(sql`first_name = ${personData.firstName}`);
    }
    if (personData.lastName !== undefined) {
      updateParts.push(sql`last_name = ${personData.lastName}`);
    }
    if (personData.fullName !== undefined) {
      updateParts.push(sql`full_name = ${personData.fullName}`);
    }
    if (personData.email !== undefined) {
      updateParts.push(sql`email = ${personData.email}`);
    }
    if (personData.phone !== undefined) {
      updateParts.push(sql`phone = ${personData.phone}`);
    }
    if (personData.birthDate !== undefined) {
      updateParts.push(sql`birth_date = ${personData.birthDate}`);
    }
    if (personData.address !== undefined) {
      updateParts.push(sql`address = ${personData.address}`);
    }
    if (personData.city !== undefined) {
      updateParts.push(sql`city = ${personData.city}`);
    }
    if (personData.country !== undefined) {
      updateParts.push(sql`country = ${personData.country}`);
    }
    if (personData.notes !== undefined) {
      updateParts.push(sql`notes = ${personData.notes}`);
    }

    if (updateParts.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    updateParts.push(sql`updated_at = NOW()`);

    await this.db.execute(sql`
      UPDATE people 
      SET ${sql.join(updateParts, sql`, `)}
      WHERE id = ${id}
    `);

    const updatedPerson = await this.findById(id, true);
    if (!updatedPerson) {
      throw new Error('Failed to retrieve updated person');
    }

    return updatedPerson;
  }

  async delete(id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Delete in correct order to avoid foreign key violations
      await tx.execute(sql`DELETE FROM employment_details WHERE person_id = ${id}`);
      await tx.execute(sql`DELETE FROM person_status WHERE person_id = ${id}`);
      await tx.execute(sql`DELETE FROM person_skills WHERE person_id = ${id}`);
      await tx.execute(sql`DELETE FROM person_technologies WHERE person_id = ${id}`);
      await tx.execute(sql`DELETE FROM education WHERE person_id = ${id}`);
      await tx.execute(sql`DELETE FROM person_unavailable_dates WHERE person_id = ${id}`);
      await tx.execute(sql`DELETE FROM opportunity_role_assignments WHERE person_id = ${id}`);
      await tx.execute(sql`DELETE FROM people WHERE id = ${id}`);
    });
  }

  // Skills management - person-centric
  async addSkillToPerson(personId: string, skillData: CreatePersonSkillData): Promise<void> {
    // Look up skill by name, or create it if it doesn't exist
    const skillLookupResult = await this.db.execute(sql`
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

    // Check if person already has this skill
    const existingSkillResult = await this.db.execute(sql`
      SELECT * FROM person_skills 
      WHERE person_id = ${personId} AND skill_id = ${skillId}
    `);

    if (existingSkillResult.rows.length > 0) {
      throw new Error(`Person already has the skill '${skillData.skillName}'. Use update instead of add.`);
    }

    // Add the skill to the person
    await this.db.execute(sql`
      INSERT INTO person_skills (
        person_id, skill_id, proficiency_level, years_of_experience, 
        last_used, is_certified, certification_name, certification_date, notes
      )
      VALUES (
        ${personId},
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

  async updatePersonSkill(personId: string, skillIdentifier: string, skillData: Partial<CreatePersonSkillData>): Promise<void> {
    // Look up skill by ID or name
    let skillId: string;

    // First, try by UUID (direct skill ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(skillIdentifier)) {
      const skillByIdResult = await this.db.execute(sql`
        SELECT ps.skill_id FROM person_skills ps 
        WHERE ps.skill_id = ${skillIdentifier} AND ps.person_id = ${personId}
      `);

      if (skillByIdResult.rows.length > 0) {
        skillId = skillIdentifier;
      } else {
        throw new Error(`Skill with ID '${skillIdentifier}' not found for this person`);
      }
    } else {
      // Try to find by skill name for this person
      const skillByNameResult = await this.db.execute(sql`
        SELECT ps.skill_id FROM person_skills ps 
        INNER JOIN skills s ON ps.skill_id = s.id
        WHERE LOWER(s.name) = LOWER(${skillIdentifier}) AND ps.person_id = ${personId}
        LIMIT 1
      `);

      if (skillByNameResult.rows.length > 0) {
        skillId = skillByNameResult.rows[0].skill_id as string;
      } else {
        throw new Error(`Skill '${skillIdentifier}' not found for this person`);
      }
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

    if (updateParts.length === 0) {
      throw new Error('No valid fields provided for skill update');
    }

    updateParts.push(sql`updated_at = NOW()`);

    await this.db.execute(sql`
      UPDATE person_skills 
      SET ${sql.join(updateParts, sql`, `)}
      WHERE person_id = ${personId} AND skill_id = ${skillId}
    `);
  }

  async removeSkillFromPerson(personId: string, skillIdentifier: string): Promise<void> {
    // Look up skill by ID or name
    let skillId: string;

    // First, try by UUID (direct skill ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(skillIdentifier)) {
      const skillByIdResult = await this.db.execute(sql`
        SELECT ps.skill_id FROM person_skills ps 
        WHERE ps.skill_id = ${skillIdentifier} AND ps.person_id = ${personId}
      `);

      if (skillByIdResult.rows.length > 0) {
        skillId = skillIdentifier;
      } else {
        throw new Error(`Skill with ID '${skillIdentifier}' not found for this person`);
      }
    } else {
      // Try to find by skill name for this person
      const skillByNameResult = await this.db.execute(sql`
        SELECT ps.skill_id FROM person_skills ps 
        INNER JOIN skills s ON ps.skill_id = s.id
        WHERE LOWER(s.name) = LOWER(${skillIdentifier}) AND ps.person_id = ${personId}
        LIMIT 1
      `);

      if (skillByNameResult.rows.length > 0) {
        skillId = skillByNameResult.rows[0].skill_id as string;
      } else {
        throw new Error(`Skill '${skillIdentifier}' not found for this person`);
      }
    }

    await this.db.execute(sql`
      DELETE FROM person_skills WHERE person_id = ${personId} AND skill_id = ${skillId}
    `);
  }

  // Technologies management - person-centric
  async addTechnologyToPerson(personId: string, technologyData: CreatePersonTechnologyData): Promise<void> {
    // Look up technology by name, or create it if it doesn't exist
    const technologyLookupResult = await this.db.execute(sql`
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

    // Check if person already has this technology
    const existingTechnologyResult = await this.db.execute(sql`
      SELECT * FROM person_technologies 
      WHERE person_id = ${personId} AND technology_id = ${technologyId}
    `);

    if (existingTechnologyResult.rows.length > 0) {
      throw new Error(`Person already has the technology '${technologyData.technologyName}'. Use update instead of add.`);
    }

    // Add the technology to the person
    await this.db.execute(sql`
      INSERT INTO person_technologies (
        person_id, technology_id, proficiency_level, years_of_experience, 
        last_used, context, project_name, description
      )
      VALUES (
        ${personId},
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

  async updatePersonTechnology(personId: string, technologyIdentifier: string, technologyData: Partial<CreatePersonTechnologyData>): Promise<void> {
    // Look up technology by ID or name
    let technologyId: string;

    // First, try by UUID (direct technology ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(technologyIdentifier)) {
      const technologyByIdResult = await this.db.execute(sql`
        SELECT pt.technology_id FROM person_technologies pt 
        WHERE pt.technology_id = ${technologyIdentifier} AND pt.person_id = ${personId}
      `);

      if (technologyByIdResult.rows.length > 0) {
        technologyId = technologyIdentifier;
      } else {
        throw new Error(`Technology with ID '${technologyIdentifier}' not found for this person`);
      }
    } else {
      // Try to find by technology name for this person
      const technologyByNameResult = await this.db.execute(sql`
        SELECT pt.technology_id FROM person_technologies pt 
        INNER JOIN technologies t ON pt.technology_id = t.id
        WHERE LOWER(t.name) = LOWER(${technologyIdentifier}) AND pt.person_id = ${personId}
        LIMIT 1
      `);

      if (technologyByNameResult.rows.length > 0) {
        technologyId = technologyByNameResult.rows[0].technology_id as string;
      } else {
        throw new Error(`Technology '${technologyIdentifier}' not found for this person`);
      }
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

    if (updateParts.length === 0) {
      throw new Error('No valid fields provided for technology update');
    }

    updateParts.push(sql`updated_at = NOW()`);

    await this.db.execute(sql`
      UPDATE person_technologies 
      SET ${sql.join(updateParts, sql`, `)}
      WHERE person_id = ${personId} AND technology_id = ${technologyId}
    `);
  }

  async removeTechnologyFromPerson(personId: string, technologyIdentifier: string): Promise<void> {
    // Look up technology by ID or name
    let technologyId: string;

    // First, try by UUID (direct technology ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(technologyIdentifier)) {
      const technologyByIdResult = await this.db.execute(sql`
        SELECT pt.technology_id FROM person_technologies pt 
        WHERE pt.technology_id = ${technologyIdentifier} AND pt.person_id = ${personId}
      `);

      if (technologyByIdResult.rows.length > 0) {
        technologyId = technologyIdentifier;
      } else {
        throw new Error(`Technology with ID '${technologyIdentifier}' not found for this person`);
      }
    } else {
      // Try to find by technology name for this person
      const technologyByNameResult = await this.db.execute(sql`
        SELECT pt.technology_id FROM person_technologies pt 
        INNER JOIN technologies t ON pt.technology_id = t.id
        WHERE LOWER(t.name) = LOWER(${technologyIdentifier}) AND pt.person_id = ${personId}
        LIMIT 1
      `);

      if (technologyByNameResult.rows.length > 0) {
        technologyId = technologyByNameResult.rows[0].technology_id as string;
      } else {
        throw new Error(`Technology '${technologyIdentifier}' not found for this person`);
      }
    }

    await this.db.execute(sql`
      DELETE FROM person_technologies WHERE person_id = ${personId} AND technology_id = ${technologyId}
    `);
  }

  // Education management - person-centric
  async addEducationToPerson(personId: string, educationData: CreatePersonEducationData): Promise<string> {
    const result = await this.db.execute(sql`
      INSERT INTO education (
        person_id, institution, degree, field_of_study, start_date, 
        graduation_date, description, gpa, is_currently_enrolled
      )
      VALUES (
        ${personId},
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

  async updatePersonEducation(personId: string, educationIdentifier: string, educationData: Partial<CreatePersonEducationData>): Promise<void> {
    // Look up education by ID or institution name
    let educationId: string;

    // First, try by UUID (direct education ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(educationIdentifier)) {
      const educationByIdResult = await this.db.execute(sql`
        SELECT id FROM education 
        WHERE id = ${educationIdentifier} AND person_id = ${personId}
      `);

      if (educationByIdResult.rows.length > 0) {
        educationId = educationIdentifier;
      } else {
        throw new Error(`Education record with ID '${educationIdentifier}' not found for this person`);
      }
    } else {
      // Try to find by institution name for this person
      const educationByInstitutionResult = await this.db.execute(sql`
        SELECT id FROM education 
        WHERE LOWER(institution) = LOWER(${educationIdentifier}) AND person_id = ${personId}
        ORDER BY start_date DESC
        LIMIT 1
      `);

      if (educationByInstitutionResult.rows.length > 0) {
        educationId = educationByInstitutionResult.rows[0].id as string;
      } else {
        throw new Error(`Education record at institution '${educationIdentifier}' not found for this person`);
      }
    }

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

    if (updateParts.length === 0) {
      throw new Error('No valid fields provided for education update');
    }

    updateParts.push(sql`updated_at = NOW()`);

    await this.db.execute(sql`
      UPDATE education 
      SET ${sql.join(updateParts, sql`, `)}
      WHERE id = ${educationId}
    `);
  }

  async removeEducationFromPerson(personId: string, educationIdentifier: string): Promise<void> {
    // Look up education by ID or institution name
    let educationId: string;

    // First, try by UUID (direct education ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(educationIdentifier)) {
      const educationByIdResult = await this.db.execute(sql`
        SELECT id FROM education 
        WHERE id = ${educationIdentifier} AND person_id = ${personId}
      `);

      if (educationByIdResult.rows.length > 0) {
        educationId = educationIdentifier;
      } else {
        throw new Error(`Education record with ID '${educationIdentifier}' not found for this person`);
      }
    } else {
      // Try to find by institution name for this person
      const educationByInstitutionResult = await this.db.execute(sql`
        SELECT id FROM education 
        WHERE LOWER(institution) = LOWER(${educationIdentifier}) AND person_id = ${personId}
        ORDER BY start_date DESC
        LIMIT 1
      `);

      if (educationByInstitutionResult.rows.length > 0) {
        educationId = educationByInstitutionResult.rows[0].id as string;
      } else {
        throw new Error(`Education record at institution '${educationIdentifier}' not found for this person`);
      }
    }

    await this.db.execute(sql`
      DELETE FROM education WHERE id = ${educationId}
    `);
  }

  // Search methods for capabilities - person-focused
  async searchPersonsBySkills(skillNames: string[]): Promise<Person[]> {
    if (skillNames.length === 0) return [];

    const result = await this.db.execute(sql`
      SELECT DISTINCT p.id
      FROM people p
      INNER JOIN person_skills ps ON p.id = ps.person_id
      INNER JOIN skills s ON ps.skill_id = s.id
      WHERE LOWER(s.name) IN (${sql.raw(skillNames.map(name => `'${name.toLowerCase()}'`).join(','))})
    `);

    const personIds = result.rows.map(row => row.id as string);
    if (personIds.length === 0) return [];

    const persons = await Promise.all(
      personIds.map(id => this.findById(id, true))
    );

    return persons.filter(person => person !== null) as Person[];
  }

  async searchPersonsByTechnologies(technologyNames: string[]): Promise<Person[]> {
    if (technologyNames.length === 0) return [];

    const result = await this.db.execute(sql`
      SELECT DISTINCT p.id
      FROM people p
      INNER JOIN person_technologies pt ON p.id = pt.person_id
      INNER JOIN technologies t ON pt.technology_id = t.id
      WHERE LOWER(t.name) IN (${sql.raw(technologyNames.map(name => `'${name.toLowerCase()}'`).join(','))})
    `);

    const personIds = result.rows.map(row => row.id as string);
    if (personIds.length === 0) return [];

    const persons = await Promise.all(
      personIds.map(id => this.findById(id, true))
    );

    return persons.filter(person => person !== null) as Person[];
  }

  async searchPersonsByEducation(institution?: string, degree?: string, fieldOfStudy?: string): Promise<Person[]> {
    const whereConditions: string[] = [];

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
      INNER JOIN education e ON p.id = e.person_id
      WHERE ${sql.raw(whereConditions.join(' AND '))}
    `);

    const personIds = result.rows.map(row => row.id as string);
    if (personIds.length === 0) return [];

    const persons = await Promise.all(
      personIds.map(id => this.findById(id, true))
    );

    return persons.filter(person => person !== null) as Person[];
  }

  // General search for RAG functionality
  async searchPersonsByText(searchText: string): Promise<Person[]> {
    const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.length > 0);
    if (searchTerms.length === 0) return [];

    // Search across person info, skills, technologies, and education
    const result = await this.db.execute(sql`
      SELECT DISTINCT p.id
      FROM people p
      LEFT JOIN person_skills ps ON p.id = ps.person_id
      LEFT JOIN skills s ON ps.skill_id = s.id
      LEFT JOIN person_technologies pt ON p.id = pt.person_id
      LEFT JOIN technologies t ON pt.technology_id = t.id
      LEFT JOIN education e ON p.id = e.person_id
      WHERE 
        LOWER(p.first_name) LIKE '%${searchTerms[0]}%' OR
        LOWER(p.last_name) LIKE '%${searchTerms[0]}%' OR
        LOWER(p.email) LIKE '%${searchTerms[0]}%' OR
        LOWER(p.city) LIKE '%${searchTerms[0]}%' OR
        LOWER(p.country) LIKE '%${searchTerms[0]}%' OR
        LOWER(p.notes) LIKE '%${searchTerms[0]}%' OR
        LOWER(s.name) LIKE '%${searchTerms[0]}%' OR
        LOWER(t.name) LIKE '%${searchTerms[0]}%' OR
        LOWER(e.institution) LIKE '%${searchTerms[0]}%' OR
        LOWER(e.degree) LIKE '%${searchTerms[0]}%' OR
        LOWER(e.field_of_study) LIKE '%${searchTerms[0]}%'
    `);

    const personIds = result.rows.map(row => row.id as string);
    if (personIds.length === 0) return [];

    const persons = await Promise.all(
      personIds.map(id => this.findById(id, true))
    );

    return persons.filter(person => person !== null) as Person[];
  }

  // Private helper methods
  private async loadCapabilities(person: Person): Promise<void> {
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
      WHERE ps.person_id = ${person.id}
      ORDER BY s.name
    `);

    person.skills = skillsResult.rows.map(row => ({
      skillId: row.skillId as string,
      skillName: row.skillName as string,
      skillCategory: row.skillCategory as string | null,
      skillDescription: row.skillDescription as string | null,
      proficiencyLevel: row.proficiencyLevel as string | null,
      yearsOfExperience: row.yearsOfExperience as string | null,
      lastUsed: row.lastUsed as Date | null,
      isCertified: row.isCertified as boolean,
      certificationName: row.certificationName as string | null,
      certificationDate: row.certificationDate as Date | null,
      notes: row.notes as string | null,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    }));

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
      WHERE pt.person_id = ${person.id}
      ORDER BY t.name
    `);

    person.technologies = technologiesResult.rows.map(row => ({
      technologyId: row.technologyId as string,
      technologyName: row.technologyName as string,
      technologyCategory: row.technologyCategory as string | null,
      technologyDescription: row.technologyDescription as string | null,
      technologyVersion: row.technologyVersion as string | null,
      proficiencyLevel: row.proficiencyLevel as string | null,
      yearsOfExperience: row.yearsOfExperience as string | null,
      lastUsed: row.lastUsed as Date | null,
      context: row.context as string | null,
      projectName: row.projectName as string | null,
      description: row.description as string | null,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    }));

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
      WHERE person_id = ${person.id}
      ORDER BY start_date DESC
    `);

    person.education = educationResult.rows.map(row => ({
      id: row.id as string,
      institution: row.institution as string,
      degree: row.degree as string | null,
      fieldOfStudy: row.fieldOfStudy as string | null,
      startDate: row.startDate as Date | null,
      graduationDate: row.graduationDate as Date | null,
      description: row.description as string | null,
      gpa: row.gpa as string | null,
      isCurrentlyEnrolled: row.isCurrentlyEnrolled as string | null,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    }));
  }

  private mapToEntity(data: PersonData): Person {
    return new Person(data);
  }
} 