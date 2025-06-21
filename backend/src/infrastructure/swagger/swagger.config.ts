import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Opportunit',
      version: '1.0.0',
      description: 'Opportunity with management',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.production.com',
        description: 'Production server',
      },
    ],
    components: {
      responses: {
        NotFound: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['error'],
                    example: 'error'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Resource not found'
                      },
                      code: {
                        type: 'string',
                        example: 'NOT_FOUND'
                      }
                    },
                    required: ['message', 'code']
                  }
                },
                required: ['status', 'data']
              }
            }
          }
        },
        BadRequest: {
          description: 'The request was invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Authentication is required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        Forbidden: {
          description: 'Permission denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['error'],
                    example: 'error'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Internal server error'
                      },
                      code: {
                        type: 'string',
                        example: 'INTERNAL_ERROR'
                      }
                    },
                    required: ['message', 'code']
                  }
                },
                required: ['status', 'data']
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['error'],
                    example: 'error'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Invalid request body'
                      },
                      code: {
                        type: 'string',
                        example: 'VALIDATION_ERROR'
                      },
                      details: {
                        type: 'object',
                        description: 'Detailed validation errors',
                        example: {
                          firstName: {
                            _errors: ['String must contain at least 1 character(s)']
                          },
                          email: {
                            _errors: ['Invalid email']
                          }
                        }
                      }
                    },
                    required: ['message', 'code']
                  }
                },
                required: ['status', 'data']
              }
            }
          }
        }
      },
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the employee (used for CRUD operations)',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            personId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the person record',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            firstName: {
              type: 'string',
              description: 'First name of the employee',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Last name of the employee',
              example: 'Doe'
            },
            fullName: {
              type: 'string',
              description: 'Full name of the employee',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the employee',
              example: 'john.doe@company.com'
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'Phone number of the employee',
              example: '+1-555-0123'
            },
            birthDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Birth date of the employee',
              example: '1990-05-15T00:00:00Z'
            },
            address: {
              type: 'string',
              nullable: true,
              description: 'Address of the employee',
              example: '123 Main St, Anytown, USA'
            },
            city: {
              type: 'string',
              nullable: true,
              description: 'City where the employee lives',
              example: 'New York'
            },
            country: {
              type: 'string',
              nullable: true,
              description: 'Country where the employee lives',
              example: 'USA'
            },
            personNotes: {
              type: 'string',
              nullable: true,
              description: 'Personal notes about the employee',
              example: 'Prefers remote work'
            },
            personCreatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the person record was created',
              example: '2024-01-10T09:00:00Z'
            },
            employmentDetailsId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Unique identifier for employment details',
              example: '456e7890-e89b-12d3-a456-426614174001'
            },
            employeeId: {
              type: 'string',
              nullable: true,
              description: 'Employee ID (company-specific)',
              example: 'EMP001'
            },
            hireDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date when the employee was hired',
              example: '2024-01-15T00:00:00Z'
            },
            terminationDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date when the employee was terminated (if applicable)',
              example: null
            },
            position: {
              type: 'string',
              nullable: true,
              description: 'Job position/title',
              example: 'Senior Software Engineer'
            },
            employmentType: {
              type: 'string',
              nullable: true,
              description: 'Type of employment',
              example: 'Full-time'
            },
            salary: {
              type: 'number',
              nullable: true,
              description: 'Annual salary',
              example: 75000.00
            },
            hourlyRate: {
              type: 'number',
              nullable: true,
              description: 'Hourly rate (for hourly employees)',
              example: 45.50
            },
            managerId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Manager\'s person ID',
              example: '789e0123-e89b-12d3-a456-426614174002'
            },
            employeeStatus: {
              type: 'string',
              enum: ['Active', 'On Leave', 'Inactive'],
              nullable: true,
              description: 'Current employment status',
              example: 'Active'
            },
            workStatus: {
              type: 'string',
              enum: ['On Project', 'On Bench', 'Available'],
              nullable: true,
              description: 'Current work assignment status',
              example: 'On Project'
            },
            jobGrade: {
              type: 'string',
              enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
              nullable: true,
              description: 'Job grade level',
              example: 'SE'
            },
            location: {
              type: 'string',
              nullable: true,
              description: 'Work location',
              example: 'New York Office'
            },
            emergencyContactName: {
              type: 'string',
              nullable: true,
              description: 'Emergency contact name',
              example: 'Jane Doe'
            },
            emergencyContactPhone: {
              type: 'string',
              nullable: true,
              description: 'Emergency contact phone',
              example: '+1-555-0456'
            },
            employmentNotes: {
              type: 'string',
              nullable: true,
              description: 'Employment-related notes',
              example: 'Promoted to senior level in 2023'
            },
            employmentCreatedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When employment record was created',
              example: '2022-01-15T10:00:00Z'
            },
            employmentUpdatedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When employment record was last updated',
              example: '2024-01-15T14:30:00Z'
            },
            yearsOfExperience: {
              type: 'number',
              description: 'Years of experience since hire date',
              example: 2
            },
            isInactive: {
              type: 'boolean',
              description: 'Whether the employee is inactive',
              example: false
            },
            isOnBench: {
              type: 'boolean',
              description: 'Whether the employee is on bench',
              example: false
            },
            skills: {
              type: 'array',
              description: 'Employee skills (included by default, excluded when includeRelated=false)',
              items: {
                $ref: '#/components/schemas/EmployeeSkill'
              },
              example: [
                {
                  skillId: '550e8400-e29b-41d4-a716-446655440000',
                  skillName: 'JavaScript',
                  skillCategory: 'Programming Language',
                  skillDescription: 'High-level programming language',
                  proficiencyLevel: 'ADVANCED',
                  yearsOfExperience: '5',
                  lastUsed: '2024-01-15T00:00:00Z',
                  isCertified: true,
                  certificationName: 'JavaScript Professional Certificate',
                  certificationDate: '2023-06-15T00:00:00Z',
                  notes: 'Extensive experience with React and Node.js',
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-15T00:00:00Z'
                }
              ]
            },
            technologies: {
              type: 'array',
              description: 'Employee technologies (included by default, excluded when includeRelated=false)',
              items: {
                $ref: '#/components/schemas/EmployeeTechnology'
              },
              example: [
                {
                  technologyId: '550e8400-e29b-41d4-a716-446655440001',
                  technologyName: 'React',
                  technologyCategory: 'Frontend Framework',
                  technologyDescription: 'JavaScript library for building user interfaces',
                  proficiencyLevel: 'ADVANCED',
                  yearsOfExperience: '4',
                  lastUsed: '2024-01-10T00:00:00Z',
                  context: 'Frontend Development',
                  projectName: 'E-commerce Platform',
                  description: 'Built scalable React components for user interfaces',
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-10T00:00:00Z'
                }
              ]
            },
            education: {
              type: 'array',
              description: 'Employee education (included by default, excluded when includeRelated=false)',
              items: {
                $ref: '#/components/schemas/EmployeeEducation'
              },
              example: [
                {
                  educationId: '550e8400-e29b-41d4-a716-446655440002',
                  institution: 'Stanford University',
                  degree: 'Bachelor of Science',
                  fieldOfStudy: 'Computer Science',
                  startDate: '2018-09-01T00:00:00Z',
                  graduationDate: '2022-06-15T00:00:00Z',
                  description: 'Focused on software engineering and algorithms',
                  gpa: '3.8',
                  isCurrentlyEnrolled: 'false',
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z'
                }
              ]
            }
          },
          required: ['id', 'personId', 'firstName', 'lastName', 'fullName', 'email', 'personCreatedAt', 'isInactive', 'isOnBench']
        },
        Opportunity: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier (UUID) for the opportunity',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            opportunityName: {
              type: 'string',
              description: 'Name of the opportunity',
              example: 'E-Commerce Platform Redesign'
            },
            clientId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Client UUID reference',
              example: '456e7890-e89b-12d3-a456-426614174001'
            },
            clientName: {
              type: 'string',
              nullable: true,
              description: 'Client company name',
              example: 'TechCorp Inc.'
            },
            expectedStartDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Expected project start date',
              example: '2024-03-15'
            },
            expectedEndDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Expected project end date',
              example: '2024-09-15'
            },
            probability: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Success probability percentage',
              example: 75
            },
            status: {
              type: 'string',
              enum: ['In Progress', 'On Hold', 'Done'],
              description: 'Current status of the opportunity',
              example: 'In Progress'
            },
            comment: {
              type: 'string',
              nullable: true,
              description: 'Additional comments or notes',
              example: 'High priority client project'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the opportunity is currently active',
              example: true
            },
            activatedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When the opportunity was activated',
              example: '2024-01-15T10:30:00Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the opportunity was created',
              example: '2024-01-10T09:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the opportunity was last updated',
              example: '2024-01-16T14:20:00Z'
            },
            // Computed fields from presentation layer (extends schema automatically)
            isHighProbability: {
              type: 'boolean',
              description: 'Whether the opportunity has high probability (>= 80%) - computed from business logic',
              example: true
            },
            duration: {
              type: 'integer',
              nullable: true,
              description: 'Project duration in days - computed from start/end dates',
              example: 180
            },
            isExpiringSoon: {
              type: 'boolean',
              description: 'Whether the opportunity is expiring within 30 days - computed from end date',
              example: false
            },
            // Roles attached by service layer
            roles: {
              type: 'array',
              description: 'Array of roles associated with this opportunity',
              items: {
                $ref: '#/components/schemas/Role'
              },
              example: [
                {
                  id: '789e0123-e89b-12d3-a456-426614174003',
                  opportunityId: '123e4567-e89b-12d3-a456-426614174000',
                  roleName: 'Senior Frontend Developer',
                  jobGrade: 'SE',
                  level: 'High',
                  allocation: 80,
                  status: 'Open',
                  notes: 'React experience required',
                  createdAt: '2024-01-10T09:00:00Z',
                  updatedAt: '2024-01-16T14:20:00Z'
                }
              ]
            }
          },
          required: ['id', 'opportunityName', 'status', 'isActive', 'createdAt', 'updatedAt', 'isHighProbability', 'duration', 'isExpiringSoon', 'roles']
        },
        CreateOpportunity: {
          type: 'object',
          required: ['opportunityName', 'clientName', 'status'],
          additionalProperties: false,
          description: 'Schema for creating a new opportunity',
          properties: {
            opportunityName: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Name/title of the opportunity',
              example: 'E-commerce Platform Development'
            },
            clientName: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Name of the client company',
              example: 'TechCorp Inc.'
            },
            expectedStartDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Expected project start date (ISO 8601 format)',
              example: '2024-04-01T00:00:00Z'
            },
            expectedEndDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Expected project end date (ISO 8601 format)',
              example: '2024-10-31T00:00:00Z'
            },
            probability: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Success probability percentage (0-100)',
              example: 75
            },
            status: {
              type: 'string',
              enum: ['In Progress', 'On Hold', 'Done'],
              description: 'Current status of the opportunity',
              example: 'In Progress'
            },
            comment: {
              type: 'string',
              nullable: true,
              maxLength: 1000,
              description: 'Additional comments or notes about the opportunity',
              example: 'High-priority client with potential for long-term partnership'
            }
          }
        },
        UpdateOpportunity: {
          type: 'object',
          additionalProperties: false,
          description: 'Schema for updating opportunity information via PATCH request. All fields are optional.',
          properties: {
            opportunityName: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Name/title of the opportunity',
              example: 'E-commerce Platform Development'
            },
            clientName: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Name of the client company',
              example: 'TechCorp Inc.'
            },
            expectedStartDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Expected project start date (ISO 8601 format)',
              example: '2024-04-01T00:00:00Z'
            },
            expectedEndDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Expected project end date (ISO 8601 format)',
              example: '2024-10-31T00:00:00Z'
            },
            probability: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Success probability percentage (0-100)',
              example: 75
            },
            status: {
              type: 'string',
              enum: ['In Progress', 'On Hold', 'Done'],
              description: 'Current status of the opportunity',
              example: 'In Progress'
            },
            comment: {
              type: 'string',
              nullable: true,
              maxLength: 1000,
              description: 'Additional comments or notes about the opportunity',
              example: 'Updated timeline due to client requirements change'
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier (UUID) for the role',
              example: '789e0123-e89b-12d3-a456-426614174003'
            },
            opportunityId: {
              type: 'string',
              format: 'uuid',
              description: 'Reference to the opportunity UUID',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            roleName: {
              type: 'string',
              description: 'Name of the role',
              example: 'Senior Frontend Developer'
            },
            jobGrade: {
              $ref: '#/components/schemas/JobGrade',
              description: 'Job grade for the role'
            },
            level: {
              $ref: '#/components/schemas/OpportunityLevel',
              description: 'Priority/importance level of the role'
            },
            allocation: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Allocation percentage (0-100)',
              example: 100
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Role start date',
              example: '2024-01-15T00:00:00.000Z'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Role end date',
              example: '2024-12-31T00:00:00.000Z'
            },
            status: {
              $ref: '#/components/schemas/RoleStatus',
              description: 'Current status of the role'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Additional notes about the role',
              example: 'Looking for someone with React and TypeScript experience'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-01T12:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-02T14:30:00.000Z'
            },
            // Assigned members attached by service layer
            assignedMembers: {
              type: 'array',
              description: 'Array of people assigned to this role',
              items: {
                $ref: '#/components/schemas/AssignedMember'
              },
              example: [
                {
                  id: '456e7890-e89b-12d3-a456-426614174001',
                  firstName: 'John',
                  lastName: 'Doe',
                  fullName: 'John Doe',
                  email: 'john.doe@company.com',
                  assignedAt: '2024-01-15T10:00:00.000Z'
                }
              ]
            }
          },
          required: ['id', 'opportunityId', 'roleName', 'status', 'createdAt', 'updatedAt', 'assignedMembers']
        },
        AssignedMember: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the person',
              example: '456e7890-e89b-12d3-a456-426614174001'
            },
            firstName: {
              type: 'string',
              description: 'First name of the person',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Last name of the person',
              example: 'Doe'
            },
            fullName: {
              type: 'string',
              description: 'Full name of the person',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the person',
              example: 'john.doe@company.com'
            },
            assignedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When the person was assigned to this role',
              example: '2024-01-15T10:00:00.000Z'
            }
          },
          required: ['id', 'firstName', 'lastName', 'fullName', 'email']
        },
        CreateRole: {
          type: 'object',
          required: ['opportunityId', 'roleName', 'status'],
          additionalProperties: false,
          properties: {
            opportunityId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the associated opportunity (must exist in database)',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            roleName: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Name/title of the role',
              example: 'Senior Frontend Developer'
            },
            jobGrade: {
              type: 'string',
              enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
              nullable: true,
              description: 'Job grade/seniority level: JT=Junior Trainee, T=Trainee, ST=Senior Trainee, EN=Engineer, SE=Senior Engineer, C=Consultant, SC=Senior Consultant, SM=Senior Manager',
              example: 'SE'
            },
            level: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
              nullable: true,
              description: 'Opportunity priority/importance level',
              example: 'High'
            },
            allocation: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Percentage of time allocated to this role (0-100%)',
              example: 80
            },
            startDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Role start date (YYYY-MM-DD format)',
              example: '2024-03-15'
            },
            endDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Role end date (YYYY-MM-DD format)',
              example: '2024-09-15'
            },
            status: {
              type: 'string',
              enum: ['Open', 'Staffed', 'Won', 'Lost'],
              description: 'Current status of the role: Open=needs to be filled, Staffed=assigned to someone, Won=successfully filled and project won, Lost=lost to competition',
              example: 'Open'
            },
            notes: {
              type: 'string',
              nullable: true,
              maxLength: 1000,
              description: 'Additional notes, requirements, or comments about the role',
              example: 'Requires 5+ years React experience and team leadership skills'
            }
          }
        },
        UpdateRole: {
          type: 'object',
          additionalProperties: false,
          description: 'Schema for updating role information via PATCH request. All fields are optional.',
          properties: {
            roleName: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Name/title of the role',
              example: 'Senior Frontend Developer'
            },
            jobGrade: {
              type: 'string',
              enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
              nullable: true,
              description: 'Job grade/seniority level: JT=Junior Trainee, T=Trainee, ST=Senior Trainee, EN=Engineer, SE=Senior Engineer, C=Consultant, SC=Senior Consultant, SM=Senior Manager',
              example: 'SE'
            },
            level: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
              nullable: true,
              description: 'Opportunity priority/importance level',
              example: 'High'
            },
            allocation: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Percentage of time allocated to this role (0-100%)',
              example: 80
            },
            startDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Role start date (YYYY-MM-DD format)',
              example: '2024-03-15'
            },
            endDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Role end date (YYYY-MM-DD format)',
              example: '2024-09-15'
            },
            status: {
              type: 'string',
              enum: ['Open', 'Staffed', 'Won', 'Lost'],
              description: 'Current status of the role: Open=needs to be filled, Staffed=assigned to someone, Won=successfully filled and project won, Lost=lost to competition',
              example: 'Open'
            },
            notes: {
              type: 'string',
              nullable: true,
              maxLength: 1000,
              description: 'Additional notes, requirements, or comments about the role',
              example: 'Updated requirements - now requires team leadership experience'
            }
          }
        },
        // Enhanced presenter response schemas
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Current page number',
              example: 1
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Items per page',
              example: 10
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of items',
              example: 25
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of pages',
              example: 3
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true
            },
            hasPreviousPage: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false
            },
            nextPage: {
              type: 'integer',
              nullable: true,
              description: 'Next page number (null if no next page)',
              example: 2
            },
            previousPage: {
              type: 'integer',
              nullable: true,
              description: 'Previous page number (null if no previous page)',
              example: null
            }
          },
          required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPreviousPage', 'nextPage', 'previousPage']
        },
        FilterParams: {
          type: 'object',
          properties: {
            client: {
              type: 'string',
              description: 'Filter by client name (partial match)',
              example: 'Herzog'
            },
            probability: {
              type: 'array',
              items: {
                type: 'integer',
                minimum: 0,
                maximum: 100
              },
              minItems: 2,
              maxItems: 2,
              description: 'Probability range filter [min, max]',
              example: [80, 100]
            },
            status: {
              type: 'string',
              enum: ['In Progress', 'On Hold', 'Done'],
              description: 'Filter by status',
              example: 'Done'
            },
            isActive: {
              type: 'boolean',
              description: 'Filter by active status',
              example: true
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Filter by start date (from)',
              example: '2025-01-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Filter by end date (to)',
              example: '2025-12-31'
            }
          }
        },
        SearchParams: {
          type: 'object',
          properties: {
            search: {
              type: 'string',
              description: 'Search term',
              example: 'Platform'
            },
            searchFields: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['opportunityName', 'clientName', 'comment']
              },
              description: 'Fields to search in',
              example: ['opportunityName', 'clientName']
            }
          }
        },
        EmployeeFilterParams: {
          type: 'object',
          properties: {
            position: {
              type: 'string',
              description: 'Filter by position (partial match)',
              example: 'Engineer'
            },
            employeeStatus: {
              type: 'string',
              enum: ['Active', 'On Leave', 'Inactive'],
              description: 'Filter by employee status',
              example: 'Active'
            },
            workStatus: {
              type: 'string',
              enum: ['On Project', 'On Bench', 'Available'],
              description: 'Filter by work status',
              example: 'On Project'
            },
            jobGrade: {
              type: 'string',
              enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
              description: 'Filter by job grade',
              example: 'SE'
            },
            location: {
              type: 'string',
              description: 'Filter by location (partial match)',
              example: 'New York'
            },
            isActive: {
              type: 'boolean',
              description: 'Filter by active status',
              example: true
            },
            dateRange: {
              type: 'object',
              properties: {
                start: {
                  type: 'string',
                  format: 'date',
                  description: 'Filter by hire date (from)',
                  example: '2024-01-01'
                },
                end: {
                  type: 'string',
                  format: 'date',
                  description: 'Filter by hire date (to)',
                  example: '2024-12-31'
                }
              }
            }
          }
        },
        EmployeeSearchParams: {
          type: 'object',
          properties: {
            search: {
              type: 'string',
              description: 'Search term',
              example: 'John'
            },
            searchFields: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['firstName', 'lastName', 'fullName', 'email', 'position', 'location']
              },
              description: 'Fields to search in',
              example: ['firstName', 'lastName', 'email']
            }
          }
        },
        SortParams: {
          type: 'object',
          properties: {
            sortBy: {
              type: 'string',
              enum: ['opportunityName', 'clientName', 'probability', 'createdAt', 'updatedAt', 'status'],
              description: 'Field to sort by',
              example: 'probability'
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort order',
              example: 'desc'
            }
          }
        },
        EmployeeSortParams: {
          type: 'object',
          properties: {
            sortBy: {
              type: 'string',
              enum: ['firstName', 'lastName', 'fullName', 'email', 'position', 'hireDate', 'employeeStatus', 'workStatus', 'jobGrade', 'location'],
              description: 'Field to sort by',
              example: 'lastName'
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort order',
              example: 'asc'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Opportunity'
              },
              description: 'Array of opportunities'
            },
            pagination: {
              $ref: '#/components/schemas/PaginationMeta'
            },
            filters: {
              $ref: '#/components/schemas/FilterParams',
              description: 'Applied filters (if any)'
            },
            search: {
              $ref: '#/components/schemas/SearchParams',
              description: 'Search parameters (if any)'
            },
            sort: {
              $ref: '#/components/schemas/SortParams',
              description: 'Sort parameters (if any)'
            }
          },
          required: ['data', 'pagination'],
          deprecated: true,
          description: 'DEPRECATED: This schema is deprecated. Use the flatter response structure instead.'
        },
        EmployeePaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Employee'
              },
              description: 'Array of employees'
            },
            pagination: {
              $ref: '#/components/schemas/PaginationMeta'
            },
            filters: {
              $ref: '#/components/schemas/EmployeeFilterParams',
              description: 'Applied filters (if any)'
            },
            search: {
              $ref: '#/components/schemas/EmployeeSearchParams',
              description: 'Search parameters (if any)'
            },
            sort: {
              $ref: '#/components/schemas/EmployeeSortParams',
              description: 'Sort parameters (if any)'
            }
          },
          required: ['data', 'pagination'],
          deprecated: true,
          description: 'DEPRECATED: This schema is deprecated. Use the flatter response structure instead.'
        },
        EnhancedMeta: {
          type: 'object',
          properties: {
            count: {
              type: 'integer',
              description: 'Number of items in current page',
              example: 5
            },
            filtered: {
              type: 'integer',
              description: 'Total items after filtering',
              example: 15
            },
            total: {
              type: 'integer',
              description: 'Total items in database',
              example: 25
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
              example: '2025-06-19T11:47:43.584Z'
            },
            endpoint: {
              type: 'string',
              description: 'API endpoint that was called',
              example: '/api/v1/opportunities'
            }
          },
          required: ['count', 'timestamp']
        },
        ApiResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success', 'error'],
              description: 'Response status',
              example: 'success'
            },
            data: {
              oneOf: [
                { $ref: '#/components/schemas/Opportunity' },
                { type: 'array', items: { $ref: '#/components/schemas/Opportunity' } },
                { $ref: '#/components/schemas/PaginatedResponse' }
              ],
              description: 'Response data (varies by endpoint)'
            },
            meta: {
              oneOf: [
                { $ref: '#/components/schemas/EnhancedMeta' },
                {
                  type: 'object',
                  properties: {
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    }
                  }
                }
              ],
              description: 'Response metadata'
            }
          },
          required: ['status', 'data', 'meta']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['error'],
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Opportunity not found'
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-16T15:30:00Z'
                },
                endpoint: {
                  type: 'string',
                  example: '/api/v1/opportunities/invalid-id'
                }
              }
            }
          },
          required: ['status', 'message', 'meta']
        },
        CreateEmployee: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'hireDate', 'position'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'First name of the employee',
              example: 'Jane'
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Last name of the employee',
              example: 'Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
              description: 'Email address of the employee',
              example: 'jane.smith@company.com'
            },
            phone: {
              type: 'string',
              maxLength: 20,
              description: 'Phone number of the employee',
              example: '+1-555-0123'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Birth date of the employee',
              example: '1990-05-15'
            },
            address: {
              type: 'string',
              description: 'Address of the employee',
              example: '123 Main St, Anytown, USA'
            },
            city: {
              type: 'string',
              maxLength: 100,
              description: 'City where the employee lives',
              example: 'San Francisco'
            },
            country: {
              type: 'string',
              maxLength: 100,
              description: 'Country where the employee lives',
              example: 'USA'
            },
            personNotes: {
              type: 'string',
              description: 'Personal notes about the employee',
              example: 'Excellent team player'
            },
            hireDate: {
              type: 'string',
              format: 'date',
              description: 'Date when the employee was hired',
              example: '2024-01-15'
            },
            position: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Job position/title',
              example: 'Product Manager'
            },
            employmentType: {
              type: 'string',
              maxLength: 50,
              description: 'Type of employment',
              example: 'Full-time'
            },
            salary: {
              type: 'number',
              minimum: 0,
              description: 'Annual salary',
              example: 95000
            },
            hourlyRate: {
              type: 'number',
              minimum: 0,
              description: 'Hourly rate (for hourly employees)',
              example: 45.50
            },
            managerId: {
              type: 'string',
              format: 'uuid',
              description: 'Manager\'s person ID',
              example: '789e0123-e89b-12d3-a456-426614174002'
            },
            employeeStatus: {
              type: 'string',
              enum: ['Active', 'On Leave', 'Inactive'],
              default: 'Active',
              description: 'Current employment status',
              example: 'Active'
            },
            workStatus: {
              type: 'string',
              enum: ['On Project', 'On Bench', 'Available'],
              default: 'Available',
              description: 'Current work assignment status',
              example: 'Available'
            },
            jobGrade: {
              type: 'string',
              enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
              description: 'Job grade level',
              example: 'SE'
            },
            location: {
              type: 'string',
              maxLength: 100,
              description: 'Work location',
              example: 'San Francisco'
            },
            emergencyContactName: {
              type: 'string',
              maxLength: 255,
              description: 'Emergency contact name',
              example: 'John Smith'
            },
            emergencyContactPhone: {
              type: 'string',
              maxLength: 20,
              description: 'Emergency contact phone',
              example: '+1-555-0456'
            },
            employmentNotes: {
              type: 'string',
              description: 'Employment-related notes',
              example: 'Starting as Product Manager'
            }
          }
        },
        UpdateEmployee: {
          type: 'object',
          description: 'Schema for PATCH operations. All fields are optional - only send the fields you want to update.',
          additionalProperties: false,
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'First name of the employee',
              example: 'Jane'
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Last name of the employee',
              example: 'Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
              description: 'Email address of the employee',
              example: 'jane.smith@company.com'
            },
            phone: {
              type: 'string',
              maxLength: 20,
              description: 'Phone number of the employee',
              example: '+1-555-0123'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Birth date of the employee',
              example: '1990-05-15'
            },
            address: {
              type: 'string',
              description: 'Address of the employee',
              example: '123 Main St, Anytown, USA'
            },
            city: {
              type: 'string',
              maxLength: 100,
              description: 'City where the employee lives',
              example: 'San Francisco'
            },
            country: {
              type: 'string',
              maxLength: 100,
              description: 'Country where the employee lives',
              example: 'USA'
            },
            personNotes: {
              type: 'string',
              description: 'Personal notes about the employee',
              example: 'Excellent team player'
            },
            hireDate: {
              type: 'string',
              format: 'date',
              description: 'Date when the employee was hired',
              example: '2024-01-15'
            },
            terminationDate: {
              type: 'string',
              format: 'date',
              description: 'Date when employment was terminated',
              example: '2024-12-31'
            },
            position: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Job position/title',
              example: 'Senior Product Manager'
            },
            employmentType: {
              type: 'string',
              maxLength: 50,
              description: 'Type of employment',
              example: 'Full-time'
            },
            salary: {
              type: 'number',
              minimum: 0,
              description: 'Annual salary',
              example: 105000
            },
            hourlyRate: {
              type: 'number',
              minimum: 0,
              description: 'Hourly rate (for hourly employees)',
              example: 50.00
            },
            managerId: {
              type: 'string',
              format: 'uuid',
              description: 'Manager\'s person ID',
              example: '789e0123-e89b-12d3-a456-426614174002'
            },
            employeeStatus: {
              type: 'string',
              enum: ['Active', 'On Leave', 'Inactive'],
              description: 'Current employment status',
              example: 'Active'
            },
            workStatus: {
              type: 'string',
              enum: ['On Project', 'On Bench', 'Available'],
              description: 'Current work assignment status',
              example: 'On Project'
            },
            jobGrade: {
              type: 'string',
              enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
              description: 'Job grade level',
              example: 'SE'
            },
            location: {
              type: 'string',
              maxLength: 100,
              description: 'Work location',
              example: 'Remote'
            },
            emergencyContactName: {
              type: 'string',
              maxLength: 255,
              description: 'Emergency contact name',
              example: 'John Smith'
            },
            emergencyContactPhone: {
              type: 'string',
              maxLength: 20,
              description: 'Emergency contact phone',
              example: '+1-555-0456'
            },
            employmentNotes: {
              type: 'string',
              description: 'Employment-related notes',
              example: 'Promoted to senior level'
            }
          }
        },
        UpdatePersonData: {
          type: 'object',
          description: 'Schema for updating personal information. All fields are optional.',
          additionalProperties: false,
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'First name of the employee',
              example: 'Jane'
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Last name of the employee',
              example: 'Smith'
            },
            fullName: {
              type: 'string',
              maxLength: 200,
              description: 'Full name of the employee',
              example: 'Jane Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
              description: 'Email address of the employee',
              example: 'jane.smith@company.com'
            },
            phone: {
              type: 'string',
              maxLength: 20,
              description: 'Phone number of the employee',
              example: '+1-555-0123'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Birth date of the employee',
              example: '1990-05-15'
            },
            address: {
              type: 'string',
              description: 'Address of the employee',
              example: '123 Main St, Anytown, USA'
            },
            city: {
              type: 'string',
              maxLength: 100,
              description: 'City where the employee lives',
              example: 'San Francisco'
            },
            country: {
              type: 'string',
              maxLength: 100,
              description: 'Country where the employee lives',
              example: 'USA'
            },
            notes: {
              type: 'string',
              description: 'Personal notes about the employee',
              example: 'Excellent team player'
            }
          }
        },
        UpdateEmploymentData: {
          type: 'object',
          description: 'Schema for updating employment information. All fields are optional.',
          additionalProperties: false,
          properties: {
            position: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Job position/title',
              example: 'Senior Software Engineer'
            },
            hireDate: {
              type: 'string',
              format: 'date',
              description: 'Date when the employee was hired',
              example: '2024-01-15'
            },
            terminationDate: {
              type: 'string',
              format: 'date',
              description: 'Date when employment was terminated',
              example: '2024-12-31'
            },
            employmentType: {
              type: 'string',
              maxLength: 50,
              description: 'Type of employment',
              example: 'Full-time'
            },
            salary: {
              type: 'number',
              minimum: 0,
              description: 'Annual salary',
              example: 110000
            },
            hourlyRate: {
              type: 'number',
              minimum: 0,
              description: 'Hourly rate (for hourly employees)',
              example: 50.00
            },
            managerId: {
              type: 'string',
              format: 'uuid',
              description: 'Manager\'s person ID',
              example: '789e0123-e89b-12d3-a456-426614174002'
            },
            employeeStatus: {
              type: 'string',
              enum: ['Active', 'On Leave', 'Inactive'],
              description: 'Current employment status',
              example: 'Active'
            },
            workStatus: {
              type: 'string',
              enum: ['On Project', 'On Bench', 'Available'],
              description: 'Current work assignment status',
              example: 'On Project'
            },
            jobGrade: {
              type: 'string',
              enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
              description: 'Job grade level',
              example: 'SE'
            },
            location: {
              type: 'string',
              maxLength: 100,
              description: 'Work location',
              example: 'Remote'
            },
            emergencyContactName: {
              type: 'string',
              maxLength: 255,
              description: 'Emergency contact name',
              example: 'John Smith'
            },
            emergencyContactPhone: {
              type: 'string',
              maxLength: 20,
              description: 'Emergency contact phone',
              example: '+1-555-0456'
            },
            notes: {
              type: 'string',
              description: 'Employment-related notes',
              example: 'Promoted to senior level'
            }
          }
        },
        // ===== EMPLOYEE SKILLS SCHEMAS =====
        CreateEmployeeSkill: {
          type: 'object',
          required: ['skillName'],
          additionalProperties: false,
          properties: {
            skillName: {
              type: 'string',
              minLength: 1,
              description: 'Name of the skill to add to the employee. If the skill doesn\'t exist in the database, it will be automatically created. Examples: JavaScript, Python, React, Node.js, Communication, Leadership, Problem Solving, etc.',
              example: 'JavaScript'
            },
            proficiencyLevel: {
              type: 'string',
              description: 'Level of proficiency with this skill',
              example: 'ADVANCED'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience with this skill',
              example: '5'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the skill was last used',
              example: '2024-01-15T00:00:00Z'
            },
            isCertified: {
              type: 'boolean',
              description: 'Whether the employee is certified in this skill',
              example: true
            },
            certificationName: {
              type: 'string',
              description: 'Name of the certification',
              example: 'JavaScript Professional Certificate'
            },
            certificationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the certification was obtained',
              example: '2023-06-15T00:00:00Z'
            },
            notes: {
              type: 'string',
              description: 'Additional notes about this skill',
              example: 'Extensive experience with React and Node.js'
            }
          }
        },
        UpdateEmployeeSkill: {
          type: 'object',
          additionalProperties: false,
          description: 'Schema for updating employee skills. All fields are optional.',
          properties: {
            proficiencyLevel: {
              type: 'string',
              description: 'Level of proficiency with this skill',
              example: 'EXPERT'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience with this skill',
              example: '7'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the skill was last used',
              example: '2024-01-15T00:00:00Z'
            },
            isCertified: {
              type: 'boolean',
              description: 'Whether the employee is certified in this skill',
              example: true
            },
            certificationName: {
              type: 'string',
              description: 'Name of the certification',
              example: 'Advanced JavaScript Certification'
            },
            certificationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the certification was obtained',
              example: '2024-01-01T00:00:00Z'
            },
            notes: {
              type: 'string',
              description: 'Additional notes about this skill',
              example: 'Updated to expert level after recent certification'
            }
          }
        },
        // ===== EMPLOYEE TECHNOLOGIES SCHEMAS =====
        CreateEmployeeTechnology: {
          type: 'object',
          required: ['technologyName'],
          additionalProperties: false,
          properties: {
            technologyName: {
              type: 'string',
              minLength: 1,
              description: 'Name of the technology to add to the employee. If the technology doesn\'t exist in the database, it will be automatically created. Examples: React, JavaScript, Python, Java, C#, Node.js, PostgreSQL, MySQL, Docker, Kubernetes, Vue.js, Angular, TypeScript, etc.',
              example: 'React'
            },
            proficiencyLevel: {
              type: 'string',
              description: 'Level of proficiency with this technology',
              example: 'ADVANCED'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience with this technology',
              example: '4'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the technology was last used',
              example: '2024-01-10T00:00:00Z'
            },
            context: {
              type: 'string',
              description: 'Context in which the technology is used',
              example: 'Frontend Development'
            },
            projectName: {
              type: 'string',
              description: 'Name of the project where technology was used',
              example: 'E-commerce Platform'
            },
            description: {
              type: 'string',
              description: 'Description of how the technology was used',
              example: 'Built scalable React components for user interfaces'
            }
          }
        },
        UpdateEmployeeTechnology: {
          type: 'object',
          additionalProperties: false,
          description: 'Schema for updating employee technologies. All fields are optional.',
          properties: {
            proficiencyLevel: {
              type: 'string',
              description: 'Level of proficiency with this technology',
              example: 'EXPERT'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience with this technology',
              example: '6'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the technology was last used',
              example: '2024-01-15T00:00:00Z'
            },
            context: {
              type: 'string',
              description: 'Context in which the technology is used',
              example: 'Full-stack Development'
            },
            projectName: {
              type: 'string',
              description: 'Name of the project where technology was used',
              example: 'Microservices Platform'
            },
            description: {
              type: 'string',
              description: 'Description of how the technology was used',
              example: 'Leading React development across multiple projects'
            }
          }
        },
        // ===== EMPLOYEE EDUCATION SCHEMAS =====
        CreateEmployeeEducation: {
          type: 'object',
          required: ['institution'],
          additionalProperties: false,
          properties: {
            institution: {
              type: 'string',
              minLength: 1,
              description: 'Name of the educational institution. You can use any institution name (e.g., Stanford University, MIT, Harvard, local colleges, online platforms like Coursera, etc.)',
              example: 'Stanford University'
            },
            degree: {
              type: 'string',
              description: 'Type of degree obtained',
              example: 'Bachelor of Science'
            },
            fieldOfStudy: {
              type: 'string',
              description: 'Field of study or major',
              example: 'Computer Science'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Start date of the education',
              example: '2018-09-01T00:00:00Z'
            },
            graduationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Graduation date',
              example: '2022-06-15T00:00:00Z'
            },
            description: {
              type: 'string',
              description: 'Description of the education',
              example: 'Focused on software engineering and algorithms'
            },
            gpa: {
              type: 'string',
              description: 'Grade Point Average',
              example: '3.8'
            },
            isCurrentlyEnrolled: {
              type: 'string',
              description: 'Whether currently enrolled',
              example: 'false'
            }
          }
        },
        UpdateEmployeeEducation: {
          type: 'object',
          additionalProperties: false,
          description: 'Schema for updating employee education. All fields are optional.',
          properties: {
            institution: {
              type: 'string',
              minLength: 1,
              description: 'Name of the educational institution. You can use any institution name (e.g., Stanford University, MIT, Harvard, local colleges, online platforms like Coursera, etc.)',
              example: 'Stanford University'
            },
            degree: {
              type: 'string',
              description: 'Type of degree obtained',
              example: 'Bachelor of Science'
            },
            fieldOfStudy: {
              type: 'string',
              description: 'Field of study or major',
              example: 'Computer Science'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Start date of the education',
              example: '2018-09-01T00:00:00Z'
            },
            graduationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Graduation date',
              example: '2022-06-15T00:00:00Z'
            },
            description: {
              type: 'string',
              description: 'Description of the education',
              example: 'Graduated summa cum laude with honors in Computer Science'
            },
            gpa: {
              type: 'string',
              description: 'Grade Point Average',
              example: '3.9'
            },
            isCurrentlyEnrolled: {
              type: 'string',
              description: 'Whether currently enrolled',
              example: 'false'
            }
          }
        },
        // ===== EMPLOYEE EXTENDED SCHEMA WITH RELATED DATA =====
        EmployeeSkill: {
          type: 'object',
          properties: {
            skillId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the skill',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            skillName: {
              type: 'string',
              description: 'Name of the skill',
              example: 'JavaScript'
            },
            skillCategory: {
              type: 'string',
              description: 'Category of the skill',
              example: 'Programming Language'
            },
            skillDescription: {
              type: 'string',
              description: 'Description of the skill',
              example: 'High-level programming language'
            },
            proficiencyLevel: {
              type: 'string',
              description: 'Employee\'s proficiency level',
              example: 'ADVANCED'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience',
              example: '5'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'Last used date',
              example: '2024-01-15T00:00:00Z'
            },
            isCertified: {
              type: 'boolean',
              description: 'Certification status',
              example: true
            },
            certificationName: {
              type: 'string',
              description: 'Certification name',
              example: 'JavaScript Professional Certificate'
            },
            certificationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Certification date',
              example: '2023-06-15T00:00:00Z'
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
              example: 'Extensive experience with React and Node.js'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-15T00:00:00Z'
            }
          }
        },
        EmployeeTechnology: {
          type: 'object',
          properties: {
            technologyId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the technology',
              example: '550e8400-e29b-41d4-a716-446655440001'
            },
            technologyName: {
              type: 'string',
              description: 'Name of the technology',
              example: 'React'
            },
            technologyCategory: {
              type: 'string',
              description: 'Category of the technology',
              example: 'Frontend Framework'
            },
            technologyDescription: {
              type: 'string',
              description: 'Description of the technology',
              example: 'JavaScript library for building user interfaces'
            },
            proficiencyLevel: {
              type: 'string',
              description: 'Employee\'s proficiency level',
              example: 'ADVANCED'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience',
              example: '4'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'Last used date',
              example: '2024-01-10T00:00:00Z'
            },
            context: {
              type: 'string',
              description: 'Usage context',
              example: 'Frontend Development'
            },
            projectName: {
              type: 'string',
              description: 'Project name',
              example: 'E-commerce Platform'
            },
            description: {
              type: 'string',
              description: 'Usage description',
              example: 'Built scalable React components for user interfaces'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-10T00:00:00Z'
            }
          }
        },
        EmployeeEducation: {
          type: 'object',
          properties: {
            educationId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the education record',
              example: '550e8400-e29b-41d4-a716-446655440002'
            },
            institution: {
              type: 'string',
              description: 'Educational institution',
              example: 'Stanford University'
            },
            degree: {
              type: 'string',
              description: 'Degree type',
              example: 'Bachelor of Science'
            },
            fieldOfStudy: {
              type: 'string',
              description: 'Field of study',
              example: 'Computer Science'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Start date',
              example: '2018-09-01T00:00:00Z'
            },
            graduationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Graduation date',
              example: '2022-06-15T00:00:00Z'
            },
            description: {
              type: 'string',
              description: 'Education description',
              example: 'Focused on software engineering and algorithms'
            },
            gpa: {
              type: 'string',
              description: 'Grade Point Average',
              example: '3.8'
            },
            isCurrentlyEnrolled: {
              type: 'string',
              description: 'Current enrollment status',
              example: 'false'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-01T00:00:00Z'
            }
          }
        },
        // ===== LOOKUP SCHEMAS =====
        Skill: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the skill',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            name: {
              type: 'string',
              description: 'Name of the skill',
              example: 'JavaScript'
            },
            category: {
              type: 'string',
              description: 'Category of the skill',
              example: 'Programming Language'
            },
            description: {
              type: 'string',
              description: 'Description of the skill',
              example: 'High-level programming language for web development'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-01T00:00:00Z'
            }
          }
        },
        Technology: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the technology',
              example: '550e8400-e29b-41d4-a716-446655440001'
            },
            name: {
              type: 'string',
              description: 'Name of the technology',
              example: 'React'
            },
            category: {
              type: 'string',
              description: 'Category of the technology',
              example: 'Frontend Framework'
            },
            description: {
              type: 'string',
              description: 'Description of the technology',
              example: 'JavaScript library for building user interfaces'
            },
            version: {
              type: 'string',
              description: 'Version of the technology',
              example: '18.0'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-01T00:00:00Z'
            }
          }
        },
        SkillsResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success'
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Skill'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total number of skills',
                  example: 55
                },
                limit: {
                  type: 'integer',
                  description: 'Number of items per page',
                  example: 50
                },
                offset: {
                  type: 'integer',
                  description: 'Number of items skipped',
                  example: 0
                },
                hasMore: {
                  type: 'boolean',
                  description: 'Whether there are more items',
                  example: false
                }
              }
            }
          }
        },
        TechnologiesResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success'
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Technology'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total number of technologies',
                  example: 42
                },
                limit: {
                  type: 'integer',
                  description: 'Number of items per page',
                  example: 50
                },
                offset: {
                  type: 'integer',
                  description: 'Number of items skipped',
                  example: 0
                },
                hasMore: {
                  type: 'boolean',
                  description: 'Whether there are more items',
                  example: false
                }
              }
            }
          }
        },
        CategoriesResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success'
            },
            data: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of categories',
              example: ['Programming Language', 'Frontend Framework', 'Database', 'Cloud Platform']
            }
          }
        },
        // ===== PERSON SCHEMAS =====
        Person: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the person',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            firstName: {
              type: 'string',
              description: 'First name of the person',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Last name of the person',
              example: 'Doe'
            },
            fullName: {
              type: 'string',
              description: 'Full name of the person',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the person',
              example: 'john.doe@example.com'
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'Phone number of the person',
              example: '+1-555-0123'
            },
            birthDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Birth date of the person',
              example: '1990-05-15T00:00:00Z'
            },
            address: {
              type: 'string',
              nullable: true,
              description: 'Address of the person',
              example: '123 Main St, Anytown, USA'
            },
            city: {
              type: 'string',
              nullable: true,
              description: 'City where the person lives',
              example: 'New York'
            },
            country: {
              type: 'string',
              nullable: true,
              description: 'Country where the person lives',
              example: 'USA'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Notes about the person',
              example: 'Software engineer with expertise in full-stack development'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the person record was created',
              example: '2024-01-10T09:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the person record was last updated',
              example: '2024-01-15T14:30:00Z'
            }
          },
          required: ['id', 'firstName', 'lastName', 'fullName', 'email', 'createdAt', 'updatedAt']
        },
        CreatePerson: {
          type: 'object',
          required: ['firstName', 'lastName', 'email'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              description: 'First name of the person',
              example: 'Jane'
            },
            lastName: {
              type: 'string',
              minLength: 1,
              description: 'Last name of the person',
              example: 'Smith'
            },
            fullName: {
              type: 'string',
              description: 'Full name (auto-generated if not provided)',
              example: 'Jane Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the person',
              example: 'jane.smith@example.com'
            },
            phone: {
              type: 'string',
              description: 'Phone number of the person',
              example: '+1-555-0123'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Birth date of the person',
              example: '1990-05-15'
            },
            address: {
              type: 'string',
              description: 'Address of the person',
              example: '123 Main St, Anytown, USA'
            },
            city: {
              type: 'string',
              description: 'City where the person lives',
              example: 'San Francisco'
            },
            country: {
              type: 'string',
              description: 'Country where the person lives',
              example: 'USA'
            },
            notes: {
              type: 'string',
              description: 'Notes about the person',
              example: 'Software engineer with expertise in full-stack development'
            }
          }
        },
        UpdatePerson: {
          type: 'object',
          description: 'Schema for PATCH operations. All fields are optional.',
          additionalProperties: false,
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              description: 'First name of the person',
              example: 'Jane'
            },
            lastName: {
              type: 'string',
              minLength: 1,
              description: 'Last name of the person',
              example: 'Smith'
            },
            fullName: {
              type: 'string',
              description: 'Full name of the person',
              example: 'Jane Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the person',
              example: 'jane.smith@example.com'
            },
            phone: {
              type: 'string',
              description: 'Phone number of the person',
              example: '+1-555-0123'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Birth date of the person',
              example: '1990-05-15'
            },
            address: {
              type: 'string',
              description: 'Address of the person',
              example: '123 Main St, Anytown, USA'
            },
            city: {
              type: 'string',
              description: 'City where the person lives',
              example: 'San Francisco'
            },
            country: {
              type: 'string',
              description: 'Country where the person lives',
              example: 'USA'
            },
            notes: {
              type: 'string',
              description: 'Notes about the person',
              example: 'Software engineer with expertise in full-stack development'
            }
          }
        },
        CreatePersonSkill: {
          type: 'object',
          required: ['skillName'],
          properties: {
            skillName: {
              type: 'string',
              minLength: 1,
              description: 'Name of the skill (will be auto-created if not exists)',
              example: 'JavaScript'
            },
            proficiencyLevel: {
              type: 'string',
              enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
              description: 'Proficiency level in the skill',
              example: 'ADVANCED'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience with this skill',
              example: '5'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'When the skill was last used',
              example: '2024-01-15T00:00:00Z'
            },
            isCertified: {
              type: 'boolean',
              description: 'Whether the person is certified in this skill',
              example: true
            },
            certificationName: {
              type: 'string',
              description: 'Name of the certification',
              example: 'JavaScript Professional Certificate'
            },
            certificationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when certification was obtained',
              example: '2023-06-15T00:00:00Z'
            },
            notes: {
              type: 'string',
              description: 'Additional notes about this skill',
              example: 'Extensive experience with React and Node.js'
            }
          }
        },
        UpdatePersonSkill: {
          type: 'object',
          description: 'Schema for updating person skills. All fields are optional.',
          additionalProperties: false,
          properties: {
            skillName: {
              type: 'string',
              minLength: 1,
              description: 'Name of the skill',
              example: 'JavaScript'
            },
            proficiencyLevel: {
              type: 'string',
              enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
              description: 'Proficiency level in the skill',
              example: 'EXPERT'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience with this skill',
              example: '6'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'When the skill was last used',
              example: '2024-01-15T00:00:00Z'
            },
            isCertified: {
              type: 'boolean',
              description: 'Whether the person is certified in this skill',
              example: true
            },
            certificationName: {
              type: 'string',
              description: 'Name of the certification',
              example: 'JavaScript Professional Certificate'
            },
            certificationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when certification was obtained',
              example: '2023-06-15T00:00:00Z'
            },
            notes: {
              type: 'string',
              description: 'Additional notes about this skill',
              example: 'Extensive experience with React and Node.js'
            }
          }
        },
        CreatePersonTechnology: {
          type: 'object',
          required: ['technologyName'],
          properties: {
            technologyName: {
              type: 'string',
              minLength: 1,
              description: 'Name of the technology (will be auto-created if not exists)',
              example: 'React'
            },
            proficiencyLevel: {
              type: 'string',
              description: 'Proficiency level in the technology',
              example: 'Advanced'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience with this technology',
              example: '4'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'When the technology was last used',
              example: '2024-01-15T00:00:00Z'
            },
            context: {
              type: 'string',
              description: 'Context in which the technology was used',
              example: 'Frontend Development'
            },
            projectName: {
              type: 'string',
              description: 'Name of project where technology was used',
              example: 'E-commerce Platform'
            },
            description: {
              type: 'string',
              description: 'Description of technology usage',
              example: 'Built responsive user interfaces using React hooks and Redux'
            }
          }
        },
        UpdatePersonTechnology: {
          type: 'object',
          description: 'Schema for updating person technologies. All fields are optional.',
          additionalProperties: false,
          properties: {
            technologyName: {
              type: 'string',
              minLength: 1,
              description: 'Name of the technology',
              example: 'React'
            },
            proficiencyLevel: {
              type: 'string',
              description: 'Proficiency level in the technology',
              example: 'Expert'
            },
            yearsOfExperience: {
              type: 'string',
              description: 'Years of experience with this technology',
              example: '5'
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              description: 'When the technology was last used',
              example: '2024-01-15T00:00:00Z'
            },
            context: {
              type: 'string',
              description: 'Context in which the technology was used',
              example: 'Full-stack Development'
            },
            projectName: {
              type: 'string',
              description: 'Name of project where technology was used',
              example: 'Enterprise CRM System'
            },
            description: {
              type: 'string',
              description: 'Description of technology usage',
              example: 'Led development of complex React applications with TypeScript'
            }
          }
        },
        CreatePersonEducation: {
          type: 'object',
          required: ['institution'],
          properties: {
            institution: {
              type: 'string',
              minLength: 1,
              description: 'Name of the educational institution',
              example: 'Stanford University'
            },
            degree: {
              type: 'string',
              description: 'Type of degree obtained',
              example: 'Bachelor of Science'
            },
            fieldOfStudy: {
              type: 'string',
              description: 'Field of study or major',
              example: 'Computer Science'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Start date of the education',
              example: '2018-09-01T00:00:00Z'
            },
            graduationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Graduation date',
              example: '2022-06-15T00:00:00Z'
            },
            description: {
              type: 'string',
              description: 'Description of the education',
              example: 'Focused on software engineering and algorithms'
            },
            gpa: {
              type: 'string',
              description: 'Grade Point Average',
              example: '3.8'
            },
            isCurrentlyEnrolled: {
              type: 'string',
              description: 'Whether currently enrolled',
              example: 'false'
            }
          }
        },
        UpdatePersonEducation: {
          type: 'object',
          description: 'Schema for updating person education. All fields are optional.',
          additionalProperties: false,
          properties: {
            institution: {
              type: 'string',
              minLength: 1,
              description: 'Name of the educational institution',
              example: 'Stanford University'
            },
            degree: {
              type: 'string',
              description: 'Type of degree obtained',
              example: 'Bachelor of Science'
            },
            fieldOfStudy: {
              type: 'string',
              description: 'Field of study or major',
              example: 'Computer Science'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Start date of the education',
              example: '2018-09-01T00:00:00Z'
            },
            graduationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Graduation date',
              example: '2022-06-15T00:00:00Z'
            },
            description: {
              type: 'string',
              description: 'Description of the education',
              example: 'Graduated summa cum laude with honors in Computer Science'
            },
            gpa: {
              type: 'string',
              description: 'Grade Point Average',
              example: '3.9'
            },
            isCurrentlyEnrolled: {
              type: 'string',
              description: 'Whether currently enrolled',
              example: 'false'
            }
          }
        },
        // ===== EMPLOYEE PROFILE SCHEMA =====
        EmployeeProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the person (used for CRUD operations)',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            personId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the person record',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            firstName: {
              type: 'string',
              description: 'First name of the employee',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Last name of the employee',
              example: 'Doe'
            },
            fullName: {
              type: 'string',
              description: 'Full name of the employee',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the employee',
              example: 'john.doe@company.com'
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'Phone number of the employee',
              example: '+1-555-0123'
            },
            address: {
              type: 'string',
              nullable: true,
              description: 'Address of the employee',
              example: '123 Main St, Anytown, USA'
            },
            city: {
              type: 'string',
              nullable: true,
              description: 'City where the employee lives',
              example: 'New York'
            },
            country: {
              type: 'string',
              nullable: true,
              description: 'Country where the employee lives',
              example: 'USA'
            },
            birthDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Birth date of the employee',
              example: '1990-05-15T00:00:00Z'
            },
            position: {
              type: 'string',
              nullable: true,
              description: 'Job position/title',
              example: 'Senior Software Engineer'
            },
            employeeStatus: {
              type: 'string',
              enum: ['Active', 'On Leave', 'Inactive'],
              nullable: true,
              description: 'Current employment status',
              example: 'Active'
            },
            workStatus: {
              type: 'string',
              enum: ['On Project', 'On Bench', 'Available'],
              nullable: true,
              description: 'Current work assignment status',
              example: 'On Project'
            },
            jobGrade: {
              type: 'string',
              enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
              nullable: true,
              description: 'Job grade level',
              example: 'SE'
            },
            location: {
              type: 'string',
              nullable: true,
              description: 'Work location',
              example: 'New York Office'
            },
            hireDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date when the employee was hired',
              example: '2024-01-15T00:00:00Z'
            },
            terminationDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date when the employee was terminated (if applicable)',
              example: null
            },
            salary: {
              type: 'number',
              nullable: true,
              description: 'Annual salary',
              example: 75000.00
            },
            hourlyRate: {
              type: 'number',
              nullable: true,
              description: 'Hourly rate (for hourly employees)',
              example: 45.50
            },
            managerId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Manager\'s person ID',
              example: '789e0123-e89b-12d3-a456-426614174002'
            },
            yearsOfExperience: {
              type: 'number',
              description: 'Years of experience since hire date',
              example: 2
            },
            isInactive: {
              type: 'boolean',
              description: 'Whether the employee is inactive',
              example: false
            },
            isOnBench: {
              type: 'boolean',
              description: 'Whether the employee is on bench',
              example: false
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the employee is active',
              example: true
            },
            skills: {
              type: 'array',
              description: 'Employee skills',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Skill ID',
                    example: '550e8400-e29b-41d4-a716-446655440000'
                  },
                  name: {
                    type: 'string',
                    description: 'Skill name',
                    example: 'JavaScript'
                  },
                  proficiencyLevel: {
                    type: 'string',
                    description: 'Proficiency level',
                    example: 'ADVANCED'
                  },
                  yearsOfExperience: {
                    type: 'number',
                    description: 'Years of experience',
                    example: 5
                  },
                  lastUsed: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Last used date',
                    example: '2024-01-15T00:00:00Z'
                  },
                  isCertified: {
                    type: 'boolean',
                    description: 'Certification status',
                    example: true
                  },
                  certificationName: {
                    type: 'string',
                    description: 'Certification name',
                    example: 'JavaScript Professional Certificate'
                  },
                  certificationDate: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Certification date',
                    example: '2023-06-15T00:00:00Z'
                  },
                  notes: {
                    type: 'string',
                    description: 'Additional notes',
                    example: 'Extensive experience with React and Node.js'
                  }
                }
              }
            },
            technologies: {
              type: 'array',
              description: 'Employee technologies',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Technology ID',
                    example: '550e8400-e29b-41d4-a716-446655440001'
                  },
                  name: {
                    type: 'string',
                    description: 'Technology name',
                    example: 'React'
                  },
                  proficiencyLevel: {
                    type: 'string',
                    description: 'Proficiency level',
                    example: 'ADVANCED'
                  },
                  yearsOfExperience: {
                    type: 'number',
                    description: 'Years of experience',
                    example: 4
                  },
                  lastUsed: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Last used date',
                    example: '2024-01-10T00:00:00Z'
                  },
                  context: {
                    type: 'string',
                    description: 'Usage context',
                    example: 'Frontend Development'
                  },
                  projectName: {
                    type: 'string',
                    description: 'Project name',
                    example: 'E-commerce Platform'
                  },
                  description: {
                    type: 'string',
                    description: 'Usage description',
                    example: 'Built scalable React components for user interfaces'
                  }
                }
              }
            },
            education: {
              type: 'array',
              description: 'Employee education',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Education record ID',
                    example: '550e8400-e29b-41d4-a716-446655440002'
                  },
                  institution: {
                    type: 'string',
                    description: 'Educational institution',
                    example: 'Stanford University'
                  },
                  degree: {
                    type: 'string',
                    description: 'Degree type',
                    example: 'Bachelor of Science'
                  },
                  fieldOfStudy: {
                    type: 'string',
                    description: 'Field of study',
                    example: 'Computer Science'
                  },
                  startDate: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Start date',
                    example: '2018-09-01T00:00:00Z'
                  },
                  graduationDate: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Graduation date',
                    example: '2022-06-15T00:00:00Z'
                  },
                  gpa: {
                    type: 'string',
                    description: 'Grade Point Average',
                    example: '3.8'
                  },
                  description: {
                    type: 'string',
                    description: 'Education description',
                    example: 'Focused on software engineering and algorithms'
                  },
                  isCurrentlyEnrolled: {
                    type: 'boolean',
                    description: 'Current enrollment status',
                    example: false
                  }
                }
              }
            }
          },
          required: ['id', 'personId', 'firstName', 'lastName', 'fullName', 'email', 'yearsOfExperience', 'isInactive', 'isOnBench', 'isActive']
        },
        // Enum schemas
        JobGrade: {
          type: 'string',
          enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'],
          description: 'Job grade/seniority level: JT=Junior Trainee, T=Trainee, ST=Senior Trainee, EN=Engineer, SE=Senior Engineer, C=Consultant, SC=Senior Consultant, SM=Senior Manager'
        },

        OpportunityLevel: {
          type: 'string',
          enum: ['Low', 'Medium', 'High'],
          description: 'Opportunity priority/importance level'
        },

        RoleStatus: {
          type: 'string',
          enum: ['Open', 'Staffed', 'Won', 'Lost'],
          description: 'Current status of the role: Open=needs to be filled, Staffed=assigned to someone, Won=successfully filled and project won, Lost=lost to competition'
        }
      }
    }
  },
  apis: ['./src/infrastructure/http/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
