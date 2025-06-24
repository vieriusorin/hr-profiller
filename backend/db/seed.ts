/* eslint-disable */
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import db from './index';
import bcrypt from 'bcrypt';

import { users, roles, userRoles } from './schema/auth.schema';
import { clients } from './schema/clients.schema';
import { opportunities } from './schema/opportunities.schema';
import { opportunityRoles, TypeNewOpportunityRole } from './schema/opportunity-roles.schema';
import { opportunityRoleAssignments } from './schema/opportunity-role-assignments.schema';
import { people } from './schema/people.schema';
import { personStatus } from './schema/person-status.schema';
import { employmentDetails } from './schema/employment-details.schema';
import { personUnavailableDates } from './schema/person-unavailable-dates.schema';
import { education } from './schema/education.schema';
import { skills } from './schema/skills.schema';
import { personSkills } from './schema/person-skills.schema';
import { technologies } from './schema/technologies.schema';
import { personTechnologies } from './schema/person-technologies.schema';
import { personEmbeddings } from './schema/embeddings.schema';

import { jobGradeEnum } from './enums/job-grade.enum';
import { opportunityLevelEnum } from './enums/opportunity-level.enum';
import { roleStatusEnum } from './enums/role-status.enum';
import { TypeOpportunityStatus } from './enums/opportunity-status.enum';

const SEED_COUNT = {
  CLIENTS: 10,
  PEOPLE: 80, // Total people (candidates + employees)
  EMPLOYEES_PERCENTAGE: 40, // 40% will be employees, 60% candidates
  OPPORTUNITIES: 12,
  ROLES_PER_OPPORTUNITY: 3,
  UNAVAILABLE_DATES_PER_PERSON: 2,
  SKILLS: 50,
  TECHNOLOGIES: 40,
  EDUCATION_PER_PERSON: 2,
  SKILLS_PER_PERSON: 8,
  TECHNOLOGIES_PER_PERSON: 6,
};

// Helper functions
const generatePhoneNumber = () => faker.phone.number({ style: 'human' }).substring(0, 20);

function getRandomDate(from: Date, to: Date): Date {
  // Ensure both dates are valid
  if (!(from instanceof Date && !isNaN(from.getTime())) || !(to instanceof Date && !isNaN(to.getTime()))) {
    // If either date is invalid, use a safe default range
    const now = new Date();
    from = now;
    to = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  }
  return faker.date.between({ from, to });
}

function getRandomArrayElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to convert date to string format
function dateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to safely convert date or return undefined for optional dates
function dateToStringOptional(date: Date | undefined): string | undefined {
  return date ? dateToString(date) : undefined;
}

// Seed Auth Roles and Admin User
async function seedAuth() {
  console.log('Seeding auth roles and admin user...');

  // 1. Seed Roles
  const roleData = [
    { name: 'admin', description: 'Administrator with all permissions' },
    { name: 'hr_manager', description: 'Human Resources Manager' },
    { name: 'recruiter', description: 'Recruiter for new opportunities' },
    { name: 'employee', description: 'Standard employee user' },
  ];

  const insertedRoles = await db.insert(roles).values(roleData).returning();
  console.log(`Seeded ${insertedRoles.length} roles`);

  // 2. Seed Admin User
  const adminRole = insertedRoles.find(r => r.name === 'admin');
  if (!adminRole) {
    console.error('Admin role not found after seeding. Aborting admin user creation.');
    return;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds);

  const adminData = {
    name: 'Admin User',
    email: 'admin@ddroidd.com',
    passwordHash,
    isActive: true,
  };

  const insertedUsers = await db.insert(users).values(adminData).returning();
  const adminUser = insertedUsers[0];
  console.log('Seeded admin user');

  // 3. Assign Admin Role to Admin User
  await db.insert(userRoles).values({
    userId: adminUser.id,
    roleId: adminRole.id,
  });
  console.log('Assigned admin role to admin user');
}

// Seed clients
async function seedClients() {
  console.log('Seeding clients...');
  const clientsData: any[] = [];

  for (let i = 0; i < SEED_COUNT.CLIENTS; i++) {
    const clientId = randomUUID();
    const clientData = {
      id: clientId,
      name: faker.company.name(),
      industry: faker.company.buzzPhrase().split(' ')[0],
      contactPerson: faker.person.fullName(),
      email: faker.internet.email(),
      phone: generatePhoneNumber(),
      address: faker.location.streetAddress({ useFullAddress: true }),
    };

    await db.insert(clients).values(clientData);
    clientsData.push(clientData);
  }

  console.log(`Seeded ${clientsData.length} clients`);
  return clientsData;
}

// Seed people (unified approach)
async function seedPeople() {
  console.log('Seeding people...');
  const peopleData: any[] = [];
  const employeeCount = Math.floor(SEED_COUNT.PEOPLE * (SEED_COUNT.EMPLOYEES_PERCENTAGE / 100));

  for (let i = 0; i < SEED_COUNT.PEOPLE; i++) {
    const personId = randomUUID();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const isEmployee = i < employeeCount;

    const personData = {
      id: personId,
      firstName,
      lastName,
      fullName,
      email: faker.internet.email({ firstName, lastName }),
      phone: generatePhoneNumber(),
      birthDate: getRandomDate(new Date(1980, 0, 1), new Date(2005, 0, 1)).toISOString().split('T')[0],
      address: faker.location.streetAddress({ useFullAddress: true }),
      city: faker.location.city(),
      country: faker.location.country(),
      notes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }),
    };

    try {
      await db.insert(people).values(personData);
      peopleData.push({ ...personData, isEmployee });

      // Create person status
      const personStatusId = randomUUID();
      await db.insert(personStatus).values({
        id: personStatusId,
        personId: personId,
        status: isEmployee ? 'employee' : 'candidate',
        statusChangedAt: new Date(),
        notes: `Initial ${isEmployee ? 'employee' : 'candidate'} status`,
      });

      // If employee, create employment details
      if (isEmployee) {
        const position = faker.person.jobTitle();
        const isManager = position.toLowerCase().includes('manager');

        await db.insert(employmentDetails).values({
          personId: personId,
          employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
          hireDate: getRandomDate(new Date(2020, 0, 1), new Date()),
          position,
          employmentType: faker.helpers.arrayElement(['full_time', 'part_time']),
          salary: faker.number.int({ min: 50000, max: isManager ? 200000 : 150000 }).toString(),
          employeeStatus: faker.helpers.arrayElement(['Active', 'On Leave', 'Inactive']),
          workStatus: faker.helpers.arrayElement(['On Project', 'On Bench', 'Available']),
          jobGrade: faker.helpers.arrayElement(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']),
          location: faker.helpers.arrayElement(['New York', 'London', 'Remote', 'San Francisco', 'Berlin']),
          emergencyContactName: faker.person.fullName(),
          emergencyContactPhone: generatePhoneNumber(),
        });
      }
    } catch (error) {
      console.error(`Error inserting person ${personData.fullName}:`, error);
    }

    if ((i + 1) % 20 === 0) {
      console.log(`Processed ${i + 1} people...`);
    }
  }

  console.log(`Seeded ${peopleData.length} people (${employeeCount} employees, ${peopleData.length - employeeCount} candidates)`);
  return peopleData;
}

async function seedOpportunities(clientsData: any[]): Promise<{ id: string, expectedStartDate: Date | null, expectedEndDate: Date | null }[]> {
  console.log('Seeding opportunities...');
  const opportunitiesData: any[] = [];

  for (let i = 0; i < SEED_COUNT.OPPORTUNITIES; i++) {
    const startDate = getRandomDate(new Date(2025, 7, 1), new Date(2026, 11, 31));
    const endDate = new Date(startDate.getTime() + (faker.number.int({ min: 3, max: 24 }) * 30 * 24 * 60 * 60 * 1000));

    const opportunityData: any = {
      opportunityName: faker.company.buzzPhrase(),
      status: getRandomArrayElement(['In Progress', 'On Hold', 'Done'] as TypeOpportunityStatus[]),
      clientId: faker.helpers.maybe(() => getRandomArrayElement(clientsData).id, { probability: 0.7 }),
      clientName: faker.helpers.maybe(() => faker.company.name(), { probability: 0.6 }),
      expectedStartDate: dateToString(startDate),
      expectedEndDate: dateToString(endDate),
      probability: faker.number.int({ min: 10, max: 95 }),
      comment: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }),
      isActive: faker.datatype.boolean({ probability: 0.3 }),
    };

    // Only add activatedAt if the opportunity is active
    if (opportunityData.isActive) {
      opportunityData.activatedAt = getRandomDate(new Date(), startDate);
    }

    const insertedOpportunity = await db.insert(opportunities).values(opportunityData).returning();
    opportunitiesData.push(insertedOpportunity[0]);
  }

  console.log(`Seeded ${opportunitiesData.length} opportunities`);
  
  // Convert string dates back to Date objects for return type
  return opportunitiesData.map(opp => ({
    id: opp.id,
    expectedStartDate: opp.expectedStartDate ? new Date(opp.expectedStartDate) : null,
    expectedEndDate: opp.expectedEndDate ? new Date(opp.expectedEndDate) : null,
  }));
}

async function seedOpportunityRoles(insertedOpportunities: { id: string, expectedStartDate: Date | null, expectedEndDate: Date | null }[]): Promise<any[]> {
  console.log('Seeding opportunity roles...');
  const rolesData: TypeNewOpportunityRole[] = [];
  const roleNames = [
    'Senior Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'UI/UX Designer', 'Product Manager', 'QA Engineer',
    'Data Engineer', 'Cloud Architect', 'Technical Lead', 'Scrum Master',
    'Business Analyst', 'Solution Architect', 'Mobile Developer'
  ];

  for (const opportunity of insertedOpportunities) {
    const numRoles = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numRoles; i++) {
      const now = new Date();
      // Set default dates if opportunity dates are null
      const defaultStartDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const defaultEndDate = new Date(defaultStartDate.getTime() + 90 * 24 * 60 * 60 * 1000);

      // Use opportunity dates if they exist and are valid, otherwise use defaults
      const roleStartDate = opportunity.expectedStartDate instanceof Date && !isNaN(opportunity.expectedStartDate.getTime())
        ? opportunity.expectedStartDate
        : defaultStartDate;

      const roleEndDate = opportunity.expectedEndDate instanceof Date && !isNaN(opportunity.expectedEndDate.getTime())
        ? opportunity.expectedEndDate
        : defaultEndDate;

      const roleData: TypeNewOpportunityRole = {
        opportunityId: opportunity.id,
        roleName: getRandomArrayElement(roleNames),
        jobGrade: getRandomArrayElement(jobGradeEnum.enumValues),
        level: getRandomArrayElement(opportunityLevelEnum.enumValues),
        allocation: faker.number.int({ min: 25, max: 100 }),
        startDate: roleStartDate,
        endDate: roleEndDate,
        status: getRandomArrayElement(roleStatusEnum.enumValues),
        notes: faker.lorem.paragraph()
      };

      rolesData.push(roleData);
    }
  }

  // Insert roles into database
  const insertedRoles = await db.insert(opportunityRoles).values(rolesData).returning();
  return insertedRoles;
}

// Seed opportunity role assignments
async function seedOpportunityRoleAssignments(rolesData: any[], peopleData: any[]) {
  console.log('Seeding opportunity role assignments...');

  // Get only employees
  const employees = peopleData.filter(person => person.isEmployee);

  if (employees.length === 0) {
    console.warn('No employees available for role assignments');
    return;
  }

  for (const role of rolesData) {
    if (role.status !== 'Lost') {
      const shouldAssign = faker.datatype.boolean({ probability: 0.6 });

      if (shouldAssign) {
        const employee = getRandomArrayElement(employees);

        try {
          const assignmentId = randomUUID();
          await db.insert(opportunityRoleAssignments).values({
            id: assignmentId,
            opportunityRoleId: role.id,
            personId: employee.id,
          });
        } catch (error: any) {
          if (error.code !== '23505') { // Ignore duplicate key errors
            console.error(`Error assigning person to role:`, error);
          }
        }
      }
    }
  }

  console.log('Seeded opportunity role assignments');
}

// Seed person unavailable dates
async function seedPersonUnavailableDates(peopleData: any[]) {
  console.log('Seeding person unavailable dates...');

  for (const person of peopleData) {
    const hasUnavailableDates = faker.datatype.boolean({ probability: 0.3 });

    if (hasUnavailableDates) {
      const numPeriods = faker.number.int({ min: 1, max: SEED_COUNT.UNAVAILABLE_DATES_PER_PERSON });

      for (let i = 0; i < numPeriods; i++) {
        const startDate = getRandomDate(new Date(2023, 0, 1), new Date(2025, 0, 1));
        const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 14 }) * 24 * 60 * 60 * 1000);

        const unavailableId = randomUUID();
        const unavailableData = {
          id: unavailableId,
          personId: person.id,
          startDate: dateToString(startDate),
          endDate: dateToString(endDate),
          reason: faker.helpers.arrayElement(['Vacation', 'Sick Leave', 'Personal', 'Training', 'Conference']),
        };

        await db.insert(personUnavailableDates).values(unavailableData);
      }
    }
  }

  console.log('Seeded person unavailable dates');
}

// Seed skills
async function seedSkills() {
  console.log('Seeding skills...');
  const skillsData: any[] = [];

  const skillCategories = {
    'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift'],
    'Frontend': ['React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'SASS', 'Webpack', 'Vite', 'Next.js', 'Nuxt.js'],
    'Backend': ['Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Rails', 'Laravel', 'FastAPI'],
    'Database': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'DynamoDB'],
    'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'GitLab CI', 'Terraform', 'Ansible'],
    'Tools': ['Git', 'VS Code', 'IntelliJ', 'Figma', 'Postman', 'Jira', 'Slack', 'Linear', 'Notion'],
  };

  for (const [category, skillNames] of Object.entries(skillCategories)) {
    for (const skillName of skillNames) {
      const skillId = randomUUID();
      const skillData = {
        id: skillId,
        name: skillName,
        category,
        description: `${skillName} - ${category.toLowerCase()} skill`,
      };

      await db.insert(skills).values(skillData);
      skillsData.push(skillData);
    }
  }

  console.log(`Seeded ${skillsData.length} skills`);
  return skillsData;
}

// Seed technologies
async function seedTechnologies() {
  console.log('Seeding technologies...');
  const technologiesData: any[] = [];

  const techCategories = {
    'Cloud Platforms': ['AWS EC2', 'AWS Lambda', 'Azure Functions', 'Google Cloud Run', 'Heroku', 'Vercel', 'Netlify'],
    'Databases': ['PostgreSQL 14', 'MySQL 8.0', 'MongoDB 6.0', 'Redis 7.0', 'Elasticsearch 8.0', 'InfluxDB'],
    'Message Queues': ['RabbitMQ', 'Apache Kafka', 'Redis Pub/Sub', 'AWS SQS', 'Google Pub/Sub'],
    'Monitoring': ['Prometheus', 'Grafana', 'DataDog', 'New Relic', 'Sentry', 'LogRocket'],
    'CI/CD': ['GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Travis CI', 'Azure DevOps'],
    'Testing': ['Jest', 'Cypress', 'Playwright', 'Selenium', 'JUnit', 'PyTest', 'RSpec'],
  };

  for (const [category, techNames] of Object.entries(techCategories)) {
    for (const techName of techNames) {
      const techId = randomUUID();
      const techData = {
        id: techId,
        name: techName,
        category,
        description: `${techName} - ${category.toLowerCase()} technology`,
        version: faker.helpers.maybe(() => faker.system.semver(), { probability: 0.7 }),
      };

      await db.insert(technologies).values(techData);
      technologiesData.push(techData);
    }
  }

  console.log(`Seeded ${technologiesData.length} technologies`);
  return technologiesData;
}

// Seed education
async function seedEducation(peopleData: any[]) {
  console.log('Seeding education...');

  const degrees = ['Bachelor', 'Master', 'PhD', 'Associate', 'Certificate'];
  const fields = [
    'Computer Science', 'Software Engineering', 'Information Technology', 'Data Science',
    'Electrical Engineering', 'Mathematics', 'Physics', 'Business Administration',
    'Management Information Systems', 'Cybersecurity', 'Artificial Intelligence'
  ];
  const institutions = [
    'MIT', 'Stanford University', 'Carnegie Mellon', 'UC Berkeley', 'Georgia Tech',
    'University of Washington', 'Cornell University', 'Harvard University', 'Princeton',
    'Columbia University', 'NYU', 'University of Pennsylvania', 'Yale University'
  ];

  for (const person of peopleData) {
    const numEducation = faker.number.int({ min: 1, max: SEED_COUNT.EDUCATION_PER_PERSON });

    for (let i = 0; i < numEducation; i++) {
      const startDate = getRandomDate(new Date(2010, 0, 1), new Date(2024, 0, 1));
      const endDate = new Date(startDate.getTime() + (faker.number.int({ min: 2, max: 6 }) * 365 * 24 * 60 * 60 * 1000));

      const educationId = randomUUID();
      const educationData = {
        id: educationId,
        personId: person.id,
        institution: getRandomArrayElement(institutions),
        degree: getRandomArrayElement(degrees),
        fieldOfStudy: getRandomArrayElement(fields),
        startDate: dateToString(startDate),
        graduationDate: dateToString(endDate),
        description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }),
        gpa: faker.helpers.maybe(() => faker.number.float({ min: 2.5, max: 4.0, fractionDigits: 1 }).toString(), { probability: 0.7 }),
        isCurrentlyEnrolled: faker.datatype.boolean({ probability: 0.1 }) ? 'true' : 'false',
      };

      await db.insert(education).values(educationData);
    }
  }

  console.log('Seeded education records');
}

// Seed person skills
async function seedPersonSkills(peopleData: any[], skillsData: any[]) {
  console.log('Seeding person skills...');

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  for (const person of peopleData) {
    const numSkills = faker.number.int({ min: 3, max: SEED_COUNT.SKILLS_PER_PERSON });
    const selectedSkills = faker.helpers.arrayElements(skillsData, numSkills);

    for (const skill of selectedSkills) {
      const lastUsedDate = getRandomDate(new Date(2023, 0, 1), new Date());
      const certificationDate = faker.helpers.maybe(() => getRandomDate(new Date(2020, 0, 1), new Date()), { probability: 0.3 });
      
      const personSkillData = {
        personId: person.id,
        skillId: skill.id,
        proficiencyLevel: getRandomArrayElement(proficiencyLevels),
        yearsOfExperience: faker.number.int({ min: 1, max: 15 }).toString(),
        lastUsed: dateToString(lastUsedDate),
        isCertified: faker.datatype.boolean({ probability: 0.3 }),
        certificationName: faker.helpers.maybe(() => `${skill.name} Certification`, { probability: 0.3 }),
        certificationDate: dateToStringOptional(certificationDate),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
      };

      try {
        await db.insert(personSkills).values(personSkillData);
      } catch (error: any) {
        if (error.code !== '23505') { // Ignore duplicate key errors
          console.error(`Error inserting person skill:`, error);
        }
      }
    }
  }

  console.log('Seeded person skills');
}

// Seed person technologies
async function seedPersonTechnologies(peopleData: any[], technologiesData: any[]) {
  console.log('Seeding person technologies...');

  const contexts = ['Work', 'Personal Project', 'Certification', 'Bootcamp', 'University'];
  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  for (const person of peopleData) {
    const numTechnologies = faker.number.int({ min: 2, max: SEED_COUNT.TECHNOLOGIES_PER_PERSON });
    const selectedTechnologies = faker.helpers.arrayElements(technologiesData, numTechnologies);

    for (const technology of selectedTechnologies) {
      const lastUsedDate = getRandomDate(new Date(2023, 0, 1), new Date());
      
      const personTechData = {
        personId: person.id,
        technologyId: technology.id,
        proficiencyLevel: getRandomArrayElement(proficiencyLevels),
        yearsOfExperience: faker.number.int({ min: 1, max: 12 }).toString(),
        lastUsed: dateToString(lastUsedDate),
        context: getRandomArrayElement(contexts),
        projectName: faker.helpers.maybe(() => faker.company.buzzPhrase(), { probability: 0.6 }),
        description: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }),
      };

      try {
        await db.insert(personTechnologies).values(personTechData);
      } catch (error: any) {
        if (error.code !== '23505') { // Ignore duplicate key errors
          console.error(`Error inserting person technology:`, error);
        }
      }
    }
  }

  console.log('Seeded person technologies');
}

// Seed sample embeddings for demonstration
async function seedSampleEmbeddings(peopleData: any[]) {
  console.log('Seeding sample embeddings...');

  // Only seed embeddings for a subset of people to avoid excessive API calls
  const peopleToEmbed = peopleData.slice(0, Math.min(5, peopleData.length));

  for (const person of peopleToEmbed) {
    try {
      // Generate a sample embedding (1536 dimensions for text-embedding-3-small)
      const sampleEmbedding = Array.from({ length: 1536 }, () => faker.number.float({ min: -1, max: 1 }));
      
      // Generate sample searchable text
      const searchableText = `${person.firstName} ${person.lastName} ${person.email} software engineer developer`;
      
      // Generate sample metadata
      const metadata = {
        personName: `${person.firstName} ${person.lastName}`,
        email: person.email,
        skillsCount: faker.number.int({ min: 3, max: 8 }),
        technologiesCount: faker.number.int({ min: 2, max: 6 }),
        educationCount: faker.number.int({ min: 1, max: 3 }),
        lastUpdated: new Date().toISOString(),
      };

      const embeddingData = {
        personId: person.id,
        embeddingType: 'profile',
        model: 'text-embedding-3-small',
        dimension: 1536,
        embedding: JSON.stringify(sampleEmbedding),
        searchableText,
        tokensUsed: Math.ceil(searchableText.length / 4), // Rough estimate
        cost: '0.000001', // Sample cost
        metadata: JSON.stringify(metadata),
      };

      await db.insert(personEmbeddings).values(embeddingData);
      console.log(`Generated sample embedding for ${person.firstName} ${person.lastName}`);
    } catch (error: any) {
      if (error.code !== '23505') { // Ignore duplicate key errors
        console.error(`Error inserting embedding for person ${person.id}:`, error);
      }
    }
  }

  console.log(`Seeded ${peopleToEmbed.length} sample embeddings`);
}

// Main seeding function
async function main() {
  console.log('Starting database seed process...');
  const startTime = Date.now();

  try {
    // It's crucial to seed auth data first
    await seedAuth();
    
    const clientsData = await seedClients();
    const peopleData = await seedPeople();

    // Seed foundation data for skills and technologies
    const skillsData = await seedSkills();
    const technologiesData = await seedTechnologies();

    // Seed person-related data
    await seedEducation(peopleData);
    await seedPersonSkills(peopleData, skillsData);
    await seedPersonTechnologies(peopleData, technologiesData);

    const insertedOpportunities = await seedOpportunities(clientsData);
    const rolesData = await seedOpportunityRoles(insertedOpportunities);
    await seedOpportunityRoleAssignments(rolesData, peopleData);

    await seedPersonUnavailableDates(peopleData);

    // Seed sample embeddings for AI/RAG testing
    await seedSampleEmbeddings(peopleData);

    console.log('✅ Database seed process completed successfully!');
    console.log('📊 Database now contains rich person data for RAG-based matching:');
    console.log(`   - ${peopleData.length} people with education, skills, and technology experience`);
    console.log(`   - ${skillsData.length} skills across multiple categories`);
    console.log(`   - ${technologiesData.length} technologies with version info`);
    console.log('🤖 Sample embeddings generated for AI/RAG testing');
  } catch (error) {
    console.error('❌ Error during database seed:', error);
    throw error;
  }
}

main().catch((err) => {
  console.error('Error during database seed:', err);
  process.exit(1);
});