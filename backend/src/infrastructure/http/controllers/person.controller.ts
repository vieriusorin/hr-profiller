import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../shared/types';
import { PersonService } from '../../../domain/person/services/person.service';
import { QueryParser } from '../../../shared/utils/query-parser';
import { TypeNewPerson } from '../../../../db/schema/people.schema';
import { z } from 'zod';

// Validation schemas for Person domain
const CreatePersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  fullName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

const UpdatePersonSchema = CreatePersonSchema.partial();

const CreatePersonSkillSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required'),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  yearsOfExperience: z.string().optional(),
  lastUsed: z.string().optional(),
  isCertified: z.boolean().optional(),
  certificationName: z.string().optional(),
  certificationDate: z.string().optional(),
  notes: z.string().optional(),
});

const CreatePersonTechnologySchema = z.object({
  technologyName: z.string().min(1, 'Technology name is required'),
  proficiencyLevel: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  lastUsed: z.string().optional(),
  context: z.string().optional(),
  projectName: z.string().optional(),
  description: z.string().optional(),
});

const CreatePersonEducationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  graduationDate: z.string().optional(),
  description: z.string().optional(),
  gpa: z.string().optional(),
  isCurrentlyEnrolled: z.string().optional(),
});

const SearchSkillsSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

const SearchTechnologiesSchema = z.object({
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
});

const SearchEducationSchema = z.object({
  institution: z.string().optional(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
}).refine(data => Object.values(data).some(val => val), {
  message: 'At least one search criteria is required',
});

// Types for request bodies
type CreatePersonRequestData = z.infer<typeof CreatePersonSchema>;
type CreatePersonSkillRequestData = z.infer<typeof CreatePersonSkillSchema>;
type CreatePersonTechnologyRequestData = z.infer<typeof CreatePersonTechnologySchema>;
type CreatePersonEducationRequestData = z.infer<typeof CreatePersonEducationSchema>;

@injectable()
export class PersonController {
  constructor(
    @inject(TYPES.PersonService)
    private readonly personService: PersonService
  ) { }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = QueryParser.parseAll(req);
      const includeRelated = req.query.includeRelated === 'true';

      const persons = await this.personService.getAllPersons(includeRelated);

      // Apply filtering, searching, and sorting
      // For now, we'll return all persons - you can implement filtering later
      const { page = 1, limit = 10 } = queryParams;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPersons = persons.slice(startIndex, endIndex);

      const totalPages = Math.ceil(persons.length / limit);
      const pagination = {
        page,
        limit,
        total: persons.length,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      };

      const response = {
        status: 'success' as const,
        data: paginatedPersons,
        pagination,
        meta: {
          count: paginatedPersons.length,
          filtered: persons.length,
          total: persons.length,
          timestamp: new Date().toISOString(),
          endpoint: req.originalUrl,
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error in PersonController.getAll:', error);
      res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const includeRelated = req.query.includeRelated === 'true';

      const person = await this.personService.getPersonById(id, includeRelated);

      if (!person) {
        res.status(404).json({
          status: 'error',
          data: { message: 'Person not found', code: 'NOT_FOUND' },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: person,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error fetching person:', error);
      res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async create(req: Request<unknown, unknown, CreatePersonRequestData>, res: Response): Promise<void> {
    try {
      const personValidation = CreatePersonSchema.safeParse(req.body);

      if (!personValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid request body',
            code: 'VALIDATION_ERROR',
            details: personValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const personData: TypeNewPerson = {
        ...personValidation.data,
        fullName: personValidation.data.fullName || `${personValidation.data.firstName} ${personValidation.data.lastName}`,
        birthDate: personValidation.data.birthDate || undefined,
      };

      const person = await this.personService.createPerson(personData);
      res.status(201).json({
        status: 'success',
        data: person,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error creating person:', error);
      res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async update(req: Request<{ id: string }, unknown, Partial<CreatePersonRequestData>>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const personValidation = UpdatePersonSchema.safeParse(req.body);

      if (!personValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid person data',
            code: 'VALIDATION_ERROR',
            details: personValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const personUpdates = {
        firstName: personValidation.data.firstName,
        lastName: personValidation.data.lastName,
        fullName: personValidation.data.fullName,
        email: personValidation.data.email,
        phone: personValidation.data.phone,
        birthDate: personValidation.data.birthDate || null,
        address: personValidation.data.address,
        city: personValidation.data.city,
        country: personValidation.data.country,
        notes: personValidation.data.notes
      };

      const person = await this.personService.updatePerson(id, personUpdates);
      res.status(200).json({
        status: 'success',
        data: person,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error updating person:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.personService.deletePerson(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting person:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  // Skills management endpoints
  async addSkill(req: Request<{ id: string }, unknown, CreatePersonSkillRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const skillValidation = CreatePersonSkillSchema.safeParse(req.body);

      if (!skillValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid skill data',
            code: 'VALIDATION_ERROR',
            details: skillValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const skillData = {
        skillName: skillValidation.data.skillName,
        proficiencyLevel: skillValidation.data.proficiencyLevel,
        yearsOfExperience: skillValidation.data.yearsOfExperience, // Keep as string since PersonService expects string
        lastUsed: skillValidation.data.lastUsed ? new Date(skillValidation.data.lastUsed) : undefined,
        isCertified: skillValidation.data.isCertified,
        certificationName: skillValidation.data.certificationName,
        certificationDate: skillValidation.data.certificationDate ? new Date(skillValidation.data.certificationDate) : undefined,
        notes: skillValidation.data.notes
      };

      await this.personService.addSkillToPerson(id, skillData);
      res.status(201).json({
        status: 'success',
        data: { message: 'Skill added successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error adding skill to person:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async updateSkill(req: Request<{ id: string; skillId: string }, unknown, Partial<CreatePersonSkillRequestData>>, res: Response): Promise<void> {
    try {
      const { id, skillId } = req.params;
      const skillValidation = CreatePersonSkillSchema.partial().safeParse(req.body);

      if (!skillValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid skill update data',
            code: 'VALIDATION_ERROR',
            details: skillValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const skillData = {
        ...skillValidation.data,
        yearsOfExperience: skillValidation.data.yearsOfExperience, // Keep as string since PersonService expects string
        lastUsed: skillValidation.data.lastUsed ? new Date(skillValidation.data.lastUsed) : undefined,
        certificationDate: skillValidation.data.certificationDate ? new Date(skillValidation.data.certificationDate) : undefined
      };

      await this.personService.updatePersonSkill(id, skillId, skillData);
      res.status(200).json({
        status: 'success',
        data: { message: 'Skill updated successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error updating person skill:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async removeSkill(req: Request<{ id: string; skillId: string }>, res: Response): Promise<void> {
    try {
      const { id, skillId } = req.params;
      await this.personService.removeSkillFromPerson(id, skillId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing person skill:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  // Technology management endpoints
  async addTechnology(req: Request<{ id: string }, unknown, CreatePersonTechnologyRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const technologyValidation = CreatePersonTechnologySchema.safeParse(req.body);

      if (!technologyValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid technology data',
            code: 'VALIDATION_ERROR',
            details: technologyValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const technologyData = {
        technologyName: technologyValidation.data.technologyName,
        proficiencyLevel: technologyValidation.data.proficiencyLevel,
        yearsOfExperience: technologyValidation.data.yearsOfExperience, // Keep as string since PersonService expects string
        lastUsed: technologyValidation.data.lastUsed ? new Date(technologyValidation.data.lastUsed) : undefined,
        context: technologyValidation.data.context,
        projectName: technologyValidation.data.projectName,
        description: technologyValidation.data.description
      };

      await this.personService.addTechnologyToPerson(id, technologyData);
      res.status(201).json({
        status: 'success',
        data: { message: 'Technology added successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error adding technology to person:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async updateTechnology(req: Request<{ id: string; technologyId: string }, unknown, Partial<CreatePersonTechnologyRequestData>>, res: Response): Promise<void> {
    try {
      const { id, technologyId } = req.params;
      const technologyValidation = CreatePersonTechnologySchema.partial().safeParse(req.body);

      if (!technologyValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid technology update data',
            code: 'VALIDATION_ERROR',
            details: technologyValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const technologyData = {
        technologyName: technologyValidation.data.technologyName,
        proficiencyLevel: technologyValidation.data.proficiencyLevel,
        yearsOfExperience: technologyValidation.data.yearsOfExperience, // Keep as string since PersonService expects string
        lastUsed: technologyValidation.data.lastUsed ? new Date(technologyValidation.data.lastUsed) : undefined,
        context: technologyValidation.data.context,
        projectName: technologyValidation.data.projectName,
        description: technologyValidation.data.description
      };

      await this.personService.updatePersonTechnology(id, technologyId, technologyData);
      res.status(200).json({
        status: 'success',
        data: { message: 'Technology updated successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error updating person technology:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async removeTechnology(req: Request<{ id: string; technologyId: string }>, res: Response): Promise<void> {
    try {
      const { id, technologyId } = req.params;
      await this.personService.removeTechnologyFromPerson(id, technologyId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing person technology:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  // Education management endpoints
  async addEducation(req: Request<{ id: string }, unknown, CreatePersonEducationRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const educationValidation = CreatePersonEducationSchema.safeParse(req.body);

      if (!educationValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid education data',
            code: 'VALIDATION_ERROR',
            details: educationValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const educationData = {
        institution: educationValidation.data.institution,
        degree: educationValidation.data.degree,
        fieldOfStudy: educationValidation.data.fieldOfStudy,
        startDate: educationValidation.data.startDate ? new Date(educationValidation.data.startDate) : undefined,
        graduationDate: educationValidation.data.graduationDate ? new Date(educationValidation.data.graduationDate) : undefined,
        description: educationValidation.data.description,
        gpa: educationValidation.data.gpa,
        isCurrentlyEnrolled: educationValidation.data.isCurrentlyEnrolled
      };

      const educationId = await this.personService.addEducationToPerson(id, educationData);
      res.status(201).json({
        status: 'success',
        data: { message: 'Education added successfully', educationId },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error adding education to person:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async updateEducation(req: Request<{ id: string; educationId: string }, unknown, Partial<CreatePersonEducationRequestData>>, res: Response): Promise<void> {
    try {
      const { id, educationId } = req.params;
      const educationValidation = CreatePersonEducationSchema.partial().safeParse(req.body);

      if (!educationValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid education update data',
            code: 'VALIDATION_ERROR',
            details: educationValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const educationData = {
        institution: educationValidation.data.institution,
        degree: educationValidation.data.degree,
        fieldOfStudy: educationValidation.data.fieldOfStudy,
        startDate: educationValidation.data.startDate ? new Date(educationValidation.data.startDate) : undefined,
        graduationDate: educationValidation.data.graduationDate ? new Date(educationValidation.data.graduationDate) : undefined,
        description: educationValidation.data.description,
        gpa: educationValidation.data.gpa,
        isCurrentlyEnrolled: educationValidation.data.isCurrentlyEnrolled
      };

      await this.personService.updatePersonEducation(id, educationId, educationData);
      res.status(200).json({
        status: 'success',
        data: { message: 'Education updated successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error updating person education:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async removeEducation(req: Request<{ id: string; educationId: string }>, res: Response): Promise<void> {
    try {
      const { id, educationId } = req.params;
      await this.personService.removeEducationFromPerson(id, educationId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing person education:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  // Search endpoints
  async searchBySkills(req: Request<unknown, unknown, { skills: string[] }>, res: Response): Promise<void> {
    try {
      const skillsValidation = SearchSkillsSchema.safeParse(req.body);

      if (!skillsValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid skills search data',
            code: 'VALIDATION_ERROR',
            details: skillsValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const persons = await this.personService.searchPersonsBySkills(skillsValidation.data.skills);

      res.status(200).json({
        status: 'success',
        data: persons,
        meta: {
          count: persons.length,
          searchCriteria: { skills: skillsValidation.data.skills },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error searching persons by skills:', error);
      res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async searchByTechnologies(req: Request<unknown, unknown, { technologies: string[] }>, res: Response): Promise<void> {
    try {
      const technologiesValidation = SearchTechnologiesSchema.safeParse(req.body);

      if (!technologiesValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid technologies search data',
            code: 'VALIDATION_ERROR',
            details: technologiesValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const persons = await this.personService.searchPersonsByTechnologies(technologiesValidation.data.technologies);

      res.status(200).json({
        status: 'success',
        data: persons,
        meta: {
          count: persons.length,
          searchCriteria: { technologies: technologiesValidation.data.technologies },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error searching persons by technologies:', error);
      res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  async searchByEducation(req: Request<unknown, unknown, { institution?: string; degree?: string; fieldOfStudy?: string }>, res: Response): Promise<void> {
    try {
      const educationValidation = SearchEducationSchema.safeParse(req.body);

      if (!educationValidation.success) {
        res.status(400).json({
          status: 'error',
          data: {
            message: 'Invalid education search data',
            code: 'VALIDATION_ERROR',
            details: educationValidation.error.format()
          },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      const { institution, degree, fieldOfStudy } = educationValidation.data;
      const persons = await this.personService.searchPersonsByEducation(institution, degree, fieldOfStudy);

      res.status(200).json({
        status: 'success',
        data: persons,
        meta: {
          count: persons.length,
          searchCriteria: { institution, degree, fieldOfStudy },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error searching persons by education:', error);
      res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }

  // Capabilities endpoint
  async getCapabilities(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const capabilities = await this.personService.getPersonCapabilitiesSummary(id);

      res.status(200).json({
        status: 'success',
        data: {
          personId: id,
          capabilities,
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error getting person capabilities:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        data: { message: error.message || 'Internal server error', code: 'INTERNAL_ERROR' },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }
} 