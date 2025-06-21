import { EmployeeProfile } from '../../domain/employee/entities/employee-profile.entity';
import { EmployeePresentation } from '../../shared/types/presentation.types';
import { EnhancedBasePresenter } from './enhanced-base.presenter';
import {
  EmployeeFilterBuilder,
  EmployeeSearchBuilder,
  EmployeeSortBuilder
} from './builders/employee-builders';

export class EmployeePresenter extends EnhancedBasePresenter<EmployeeProfile, EmployeePresentation> {

  constructor() {
    super();

    // Set up the builders for filtering, searching, and sorting
    this.setFilterBuilder(new EmployeeFilterBuilder())
      .setSearchBuilder(new EmployeeSearchBuilder())
      .setSortBuilder(new EmployeeSortBuilder());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  present(employeeProfile: EmployeeProfile, options?: any): EmployeePresentation {
    const person = employeeProfile.person;
    const employment = employeeProfile.employment;

    // Calculate years of experience
    const yearsOfExperience = employment.hireDate
      ? Math.floor((new Date().getTime() - new Date(employment.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
      : 0;

    return {
      // Person information (primary ID for CRUD operations)
      id: person.id,
      personId: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      fullName: person.fullName,
      email: person.email,
      phone: person.phone || undefined,
      address: person.address || undefined,
      city: person.city || undefined,
      country: person.country || undefined,
      birthDate: person.birthDate ? new Date(person.birthDate).toISOString() : undefined,

      // Employment information
      position: employment.position || undefined,
      employeeStatus: employment.employeeStatus || undefined,
      workStatus: employment.workStatus || undefined,
      jobGrade: employment.jobGrade || undefined,
      location: employment.location || undefined,
      hireDate: employment.hireDate ? new Date(employment.hireDate).toISOString() : undefined,
      terminationDate: employment.terminationDate ? new Date(employment.terminationDate).toISOString() : undefined,
      salary: employment.salary || undefined,
      hourlyRate: employment.hourlyRate || undefined,
      managerId: employment.managerId || undefined,

      // Computed fields
      yearsOfExperience,
      isInactive: employment.employeeStatus === 'Inactive',
      isOnBench: employment.workStatus === 'On Bench',
      isActive: employment.isActive,

      // Related data (when included) - using correct property names
      skills: person.skills.map(skill => ({
        id: skill.skillId,
        name: skill.skillName,
        proficiencyLevel: skill.proficiencyLevel || undefined,
        yearsOfExperience: skill.yearsOfExperience ? parseInt(skill.yearsOfExperience) : undefined,
        lastUsed: skill.lastUsed ? new Date(skill.lastUsed).toISOString() : undefined,
        isCertified: skill.isCertified,
        certificationName: skill.certificationName || undefined,
        certificationDate: skill.certificationDate ? new Date(skill.certificationDate).toISOString() : undefined,
        notes: skill.notes || undefined,
      })),

      technologies: person.technologies.map(tech => ({
        id: tech.technologyId,
        name: tech.technologyName,
        proficiencyLevel: tech.proficiencyLevel || undefined,
        yearsOfExperience: tech.yearsOfExperience ? parseInt(tech.yearsOfExperience) : undefined,
        lastUsed: tech.lastUsed ? new Date(tech.lastUsed).toISOString() : undefined,
        context: tech.context || undefined,
        projectName: tech.projectName || undefined,
        description: tech.description || undefined,
      })),

      education: person.education.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree || undefined,
        fieldOfStudy: edu.fieldOfStudy || undefined,
        startDate: edu.startDate ? new Date(edu.startDate).toISOString() : undefined,
        graduationDate: edu.graduationDate ? new Date(edu.graduationDate).toISOString() : undefined,
        gpa: edu.gpa || undefined,
        description: edu.description || undefined,
        isCurrentlyEnrolled: edu.isCurrentlyEnrolled === 'true',
      })),
    };
  }
} 