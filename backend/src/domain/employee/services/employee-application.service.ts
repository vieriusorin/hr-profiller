import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { PersonService } from '../../person/services/person.service';
import { EmploymentService } from './employment.service';
import { EmployeeProfile } from '../entities/employee-profile.entity';
import { TypeNewPerson, TypePerson } from '../../../../db/schema/people.schema';
import { CreateEmploymentData } from '../repositories/employment.repository';

/**
 * EmployeeApplicationService - Coordinates between Person and Employment domains
 * This service handles cross-domain operations and creates EmployeeProfile aggregates
 */
@injectable()
export class EmployeeApplicationService {
  constructor(
    @inject(TYPES.PersonService)
    private readonly personService: PersonService,
    @inject(TYPES.EmploymentService)
    private readonly employmentService: EmploymentService
  ) { }

  /**
   * Get complete employee profile by person ID
   */
  async getEmployeeProfile(personId: string): Promise<EmployeeProfile | null> {
    const person = await this.personService.getPersonById(personId, true);
    if (!person) {
      return null;
    }

    // Get active employment for this person
    const employment = await this.employmentService.getActiveEmploymentByPersonId(personId);
    if (!employment) {
      return null; // Person exists but has no active employment
    }

    return new EmployeeProfile(person, employment);
  }

  /**
   * Get all active employee profiles
   */
  async getAllEmployeeProfiles(): Promise<EmployeeProfile[]> {
    // Get all employments and filter for active ones
    const allEmployments = await this.employmentService.getAllEmployments();
    const activeEmployments = allEmployments.filter(emp => !emp.terminationDate);

    const profiles: EmployeeProfile[] = [];

    for (const employment of activeEmployments) {
      const person = await this.personService.getPersonById(employment.personId, true);
      if (person) {
        profiles.push(new EmployeeProfile(person, employment));
      }
    }

    return profiles;
  }

  /**
   * Create a new employee (person + employment)
   * This is a cross-domain transaction
   */
  async createEmployee(
    personData: TypeNewPerson,
    employmentData: Omit<CreateEmploymentData, 'personId'>
  ): Promise<EmployeeProfile> {
    // TODO: This should be wrapped in a database transaction
    // For now, we'll do it sequentially and handle rollback manually

    try {
      // 1. Create Person first
      const person = await this.personService.createPerson(personData);

      // 2. Create Employment linked to Person
      const employment = await this.employmentService.createEmployment({
        ...employmentData,
        personId: person.id
      });

      // 3. Return EmployeeProfile
      return new EmployeeProfile(person, employment);
    } catch (error) {
      // TODO: Implement proper rollback logic in a transaction
      throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update employee profile (coordinates updates across domains)
   */
  async updateEmployeeProfile(
    personId: string,
    personUpdates?: Partial<TypePerson>,
    employmentUpdates?: Partial<CreateEmploymentData>
  ): Promise<EmployeeProfile> {
    const existingProfile = await this.getEmployeeProfile(personId);
    if (!existingProfile) {
      throw new Error('Employee profile not found');
    }

    // Update person data if provided
    if (personUpdates) {
      await this.personService.updatePerson(personId, personUpdates);
    }

    // Update employment data if provided
    if (employmentUpdates) {
      // Convert CreateEmploymentData to TypeEmploymentDetails format
      const employmentDetailsUpdate: Partial<any> = {};
      if (employmentUpdates.salary !== undefined) {
        employmentDetailsUpdate.salary = employmentUpdates.salary;
      }
      if (employmentUpdates.hourlyRate !== undefined) {
        employmentDetailsUpdate.hourlyRate = employmentUpdates.hourlyRate;
      }
      if (employmentUpdates.position !== undefined) {
        employmentDetailsUpdate.position = employmentUpdates.position;
      }
      if (employmentUpdates.location !== undefined) {
        employmentDetailsUpdate.location = employmentUpdates.location;
      }
      if (employmentUpdates.employmentType !== undefined) {
        employmentDetailsUpdate.employmentType = employmentUpdates.employmentType;
      }
      if (employmentUpdates.hireDate !== undefined) {
        employmentDetailsUpdate.hireDate = employmentUpdates.hireDate;
      }
      if (employmentUpdates.terminationDate !== undefined) {
        employmentDetailsUpdate.terminationDate = employmentUpdates.terminationDate;
      }
      if (employmentUpdates.workStatus !== undefined) {
        employmentDetailsUpdate.workStatus = employmentUpdates.workStatus;
      }
      if (employmentUpdates.employeeStatus !== undefined) {
        employmentDetailsUpdate.employeeStatus = employmentUpdates.employeeStatus;
      }
      if (employmentUpdates.managerId !== undefined) {
        employmentDetailsUpdate.managerId = employmentUpdates.managerId;
      }
      if (employmentUpdates.notes !== undefined) {
        employmentDetailsUpdate.notes = employmentUpdates.notes;
      }

      await this.employmentService.updateEmployment(existingProfile.employment.id, employmentDetailsUpdate);
    }

    // Return updated profile
    const updatedProfile = await this.getEmployeeProfile(personId);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated employee profile');
    }

    return updatedProfile;
  }

  /**
   * Search employees by skills (delegates to Person domain)
   */
  async searchEmployeesBySkills(skillNames: string[]): Promise<EmployeeProfile[]> {
    const persons = await this.personService.searchPersonsBySkills(skillNames);

    const profiles: EmployeeProfile[] = [];

    for (const person of persons) {
      const employment = await this.employmentService.getActiveEmploymentByPersonId(person.id);
      if (employment) {
        profiles.push(new EmployeeProfile(person, employment));
      }
    }

    return profiles;
  }

  /**
   * Search employees by technologies (delegates to Person domain)
   */
  async searchEmployeesByTechnologies(technologyNames: string[]): Promise<EmployeeProfile[]> {
    const persons = await this.personService.searchPersonsByTechnologies(technologyNames);

    const profiles: EmployeeProfile[] = [];

    for (const person of persons) {
      const employment = await this.employmentService.getActiveEmploymentByPersonId(person.id);
      if (employment) {
        profiles.push(new EmployeeProfile(person, employment));
      }
    }

    return profiles;
  }

  /**
   * Search employees by education (delegates to Person domain)
   */
  async searchEmployeesByEducation(
    institution?: string,
    degree?: string,
    fieldOfStudy?: string
  ): Promise<EmployeeProfile[]> {
    const persons = await this.personService.searchPersonsByEducation(institution, degree, fieldOfStudy);

    const profiles: EmployeeProfile[] = [];

    for (const person of persons) {
      const employment = await this.employmentService.getActiveEmploymentByPersonId(person.id);
      if (employment) {
        profiles.push(new EmployeeProfile(person, employment));
      }
    }

    return profiles;
  }

  /**
   * Get employee capabilities summary
   */
  async getEmployeeCapabilitiesSummary(personId: string) {
    // Verify person is an active employee first
    const profile = await this.getEmployeeProfile(personId);
    if (!profile || !profile.isActive) {
      throw new Error('Person is not an active employee');
    }

    return this.personService.getPersonCapabilitiesSummary(personId);
  }

  /**
   * Add skill to employee (delegates to Person domain)
   */
  async addSkillToEmployee(personId: string, skillData: any): Promise<void> {
    // Verify person is an active employee first
    const profile = await this.getEmployeeProfile(personId);
    if (!profile || !profile.isActive) {
      throw new Error('Person is not an active employee');
    }

    return this.personService.addSkillToPerson(personId, skillData);
  }

  /**
   * Add technology to employee (delegates to Person domain)
   */
  async addTechnologyToEmployee(personId: string, technologyData: any): Promise<void> {
    // Verify person is an active employee first
    const profile = await this.getEmployeeProfile(personId);
    if (!profile || !profile.isActive) {
      throw new Error('Person is not an active employee');
    }

    return this.personService.addTechnologyToPerson(personId, technologyData);
  }

  /**
   * Add education to employee (delegates to Person domain)
   */
  async addEducationToEmployee(personId: string, educationData: any): Promise<string> {
    // Verify person is an active employee first
    const profile = await this.getEmployeeProfile(personId);
    if (!profile || !profile.isActive) {
      throw new Error('Person is not an active employee');
    }

    return this.personService.addEducationToPerson(personId, educationData);
  }

  // Employment-specific operations

  /**
   * Promote employee (employment domain operation)
   */
  async promoteEmployee(personId: string, newPosition: string, newSalary?: number): Promise<EmployeeProfile> {
    const profile = await this.getEmployeeProfile(personId);
    if (!profile) {
      throw new Error('Employee not found');
    }

    await this.employmentService.promoteEmployee(profile.employment.id, newPosition, newSalary);

    // Return updated profile
    const updatedProfile = await this.getEmployeeProfile(personId);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated employee profile after promotion');
    }

    return updatedProfile;
  }

  /**
   * Terminate employee (employment domain operation)
   */
  async terminateEmployee(personId: string, endDate?: Date, notes?: string): Promise<EmployeeProfile> {
    const profile = await this.getEmployeeProfile(personId);
    if (!profile) {
      throw new Error('Employee not found');
    }

    await this.employmentService.terminateEmployment(profile.employment.id, endDate, notes);

    // Return the profile as it was before termination, since terminated employees
    // are no longer considered "active" and cannot be retrieved via getEmployeeProfile
    return profile;
  }

  /**
   * Assign manager to employee (employment domain operation)
   */
  async assignManager(personId: string, managerId: string): Promise<EmployeeProfile> {
    const profile = await this.getEmployeeProfile(personId);
    if (!profile) {
      throw new Error('Employee not found');
    }

    // Verify manager is also an active employee
    const managerProfile = await this.getEmployeeProfile(managerId);
    if (!managerProfile || !managerProfile.isActive) {
      throw new Error('Manager must be an active employee');
    }

    await this.employmentService.assignManager(profile.employment.id, managerId);

    // Return updated profile
    const updatedProfile = await this.getEmployeeProfile(personId);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated employee profile after manager assignment');
    }

    return updatedProfile;
  }

  /**
   * Remove manager from employee (employment domain operation)
   */
  async removeManager(personId: string): Promise<EmployeeProfile> {
    const profile = await this.getEmployeeProfile(personId);
    if (!profile) {
      throw new Error('Employee not found');
    }

    await this.employmentService.removeManager(profile.employment.id);

    // Return updated profile
    const updatedProfile = await this.getEmployeeProfile(personId);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated employee profile after manager removal');
    }

    return updatedProfile;
  }
} 