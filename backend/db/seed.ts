/* eslint-disable */
import { faker } from '@faker-js/faker';
import db from './index';
import { eq } from 'drizzle-orm';

import { departments } from './schema/departments.schema';
import { clients } from './schema/clients.schema';
import { skills } from './schema/skills.schema';
import { technologies } from './schema/technologies.schema';
import { candidates } from './schema/candidates.schema';
import { employees } from './schema/employees.schema';
import { positions } from './schema/positions.schema';
import { projects } from './schema/projects.schema';
import { education } from './schema/education.schema';
import { workExperience } from './schema/work-experience.schema';
import { candidateSkills } from './schema/candidate-skills.schema';
import { employeeSkills } from './schema/employee-skills.schema';
import { projectTechnologies } from './schema/project-technologies.schema';
import { projectTeamMembers } from './schema/project-team-members.schema';
import { meetings } from './schema/meetings.schema';
import { meetingParticipants } from './schema/meeting-participants.schema';

const SEED_COUNT = {
  DEPARTMENTS: 5,
  CLIENTS: 10,
  SKILLS: 20,
  TECHNOLOGIES: 15,
  CANDIDATES: 50,
  EMPLOYEES: 30,
  POSITIONS: 15,
  PROJECTS: 8,
  EDUCATION_PER_PERSON: 2,
  WORK_EXPERIENCE_PER_PERSON: 3,
  MEETINGS: 20,
};

// Helper function to get random date within range
function getRandomDate(from: Date, to: Date): Date {
  const fromTime = from.getTime();
  const toTime = to.getTime();

  if (fromTime > toTime) {
    // If 'from' is after 'to', log a warning and swap them to prevent Faker error.
    // This often indicates a logical issue in the calling code that should ideally be addressed.
    console.warn(`getRandomDate: "from" date (${from.toISOString()}) was after "to" date (${to.toISOString()}). Swapping them.`);
    return faker.date.between({ from: to, to: from });
  }
  // faker.date.between is inclusive. If fromTime === toTime, it will return that date.
  return faker.date.between({ from, to });
}

// Helper function to generate a formatted phone number of appropriate length
const generatePhoneNumber = () => {
  // Generate a simple phone number format that won't exceed 20 chars
  return faker.phone.number({ style: 'human' }).substring(0, 20);
};

// Helper function to get a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random items from an array
const getRandomItems = <T>(array: T[], min: number, max: number): T[] => {
  const count = faker.number.int({ min, max });
  return faker.helpers.arrayElements(array, count);
};

// Seed departments
async function seedDepartments() {
  console.log('Seeding departments: Start');
  const departmentNames = [
    'Engineering', 'Product', 'Marketing', 'Sales', 'Human Resources',
    'Finance', 'Operations', 'Customer Support', 'Research & Development', 'IT',
    // Add more unique department names if config.DEPARTMENTS is high
    'Quality Assurance', 'Legal', 'Design', 'Data Science', 'Security'
  ];
  const createdOrExistingDepartments = [];
  const DEPARTMENTS = SEED_COUNT.DEPARTMENTS;


  const numDepartmentsToCreate = Math.min(DEPARTMENTS, departmentNames.length);

  if (DEPARTMENTS > departmentNames.length) {
    console.warn(
      `SEED_COUNT.DEPARTMENTS (${DEPARTMENTS}) is greater than the number of unique department names ` +
      `(${departmentNames.length}). Will only attempt to create/use ${departmentNames.length} unique departments.`
    );
  }

  for (let i = 0; i < numDepartmentsToCreate; i++) {
    const currentDepartmentName = departmentNames[i];
    const departmentPayload = {
      name: currentDepartmentName,
      description: faker.lorem.sentence(),
    };

    try {
      const [insertedDepartment] = await db.insert(departments)
        .values(departmentPayload)
        .returning();

      if (insertedDepartment && insertedDepartment.id) {
        createdOrExistingDepartments.push(insertedDepartment);
      } else {
        // This case might indicate an issue if returning() behaves unexpectedly or if an insert fails silently
        // before a constraint violation, which is less likely for unique constraints.
        console.error(`Failed to insert department or retrieve ID for: ${departmentPayload.name}, but no specific error was thrown.`);
      }
    } catch (error: any) {
      // PostgreSQL error code for unique_violation is '23505'
      if (error.code === '23505' && error.constraint === 'departments_name_key') {
        console.warn(`Department with name "${currentDepartmentName}" already exists (constraint: ${error.constraint}). Fetching existing.`);
        const [existingDept] = await db.select().from(departments).where(eq(departments.name, currentDepartmentName));
        if (existingDept) {
          createdOrExistingDepartments.push(existingDept);
        } else {
          console.error(`Department "${currentDepartmentName}" reported as duplicate, but could not be fetched.`);
        }
      } else {
        console.error(`Error inserting department ${currentDepartmentName}:`, error);
        // Rethrow if it's an unexpected error, or handle as needed
        // For example, you might want to stop the seed if it's not a unique constraint violation:
        // throw error;
      }
    }
  }

  console.log(`Seeding departments: End. Total departments processed (created or existing): ${createdOrExistingDepartments.length}`);
  return createdOrExistingDepartments;
}

// Seed clients
async function seedClients() {
  console.log('Seeding clients: Start');
  const clientsData = [];

  for (let i = 0; i < SEED_COUNT.CLIENTS; i++) {
    const clientData = {
      name: faker.company.name(),
      industry: faker.company.buzzPhrase().split(' ')[0],
      contactPerson: faker.person.fullName(),
      email: faker.internet.email(),
      phone: generatePhoneNumber(),
      address: faker.location.streetAddress({ useFullAddress: true }),
    };

    await db.insert(clients).values(clientData);
    clientsData.push({ ...clientData, id: i + 1 });

    if (i % 5 === 0) {
      console.log(`Created ${i} clients...`);
    }
  }

  console.log('Seeding clients: End');
  return clientsData;
}

// Seed skills
async function seedSkills() {
  console.log('Seeding skills: Start');
  const skillNames = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
    'Node.js', 'Python', 'Java', 'C#', '.NET',
    'SQL', 'MongoDB', 'AWS', 'Azure', 'Docker',
    'Kubernetes', 'GraphQL', 'REST API', 'CI/CD', 'Git',
    'Agile', 'Scrum', 'Product Management', 'UX Design', 'UI Design',
    // Add more unique skills if SEED_COUNT.SKILLS is high
    'Go', 'Ruby on Rails', 'Swift', 'Kotlin', 'PHP',
    'Terraform', 'Ansible', 'Figma', 'Sketch', 'Adobe XD'
  ];

  const createdOrExistingSkills = [];

  const numSkillsToCreate = Math.min(SEED_COUNT.SKILLS, skillNames.length);

  if (SEED_COUNT.SKILLS > skillNames.length) {
    console.warn(
      `SEED_COUNT.SKILLS (${SEED_COUNT.SKILLS}) is greater than the number of unique skill names ` +
      `(${skillNames.length}). Will only attempt to create/use ${skillNames.length} unique skills.`
    );
  }

  for (let i = 0; i < numSkillsToCreate; i++) {
    const currentSkillName = skillNames[i];
    const skillPayload = {
      name: currentSkillName,
    };

    try {
      const [insertedSkill] = await db.insert(skills)
        .values(skillPayload)
        .returning();

      if (insertedSkill && insertedSkill.id) {
        createdOrExistingSkills.push(insertedSkill);
      } else {
        console.error(`Failed to insert skill or retrieve ID for: ${skillPayload.name}, but no error was thrown.`);
      }
    } catch (error: any) {
      // PostgreSQL error code for unique_violation is '23505'
      if (error.code === '23505' && error.constraint === 'skills_name_key') { // <--- CORRECTED CONSTRAINT NAME
        console.warn(`Skill with name "${currentSkillName}" already exists (constraint: ${error.constraint}). Fetching existing.`);
        const [existingSkill] = await db.select().from(skills).where(eq(skills.name, currentSkillName));
        if (existingSkill) {
          createdOrExistingSkills.push(existingSkill);
        } else {
          console.error(`Skill "${currentSkillName}" reported as duplicate, but could not be fetched.`);
        }
      } else {
        console.error(`Error inserting skill ${currentSkillName}:`, error);
        // Rethrow if it's an unexpected error, or handle as needed
        // throw error;
      }
    }
  }

  console.log(`Seeding skills: End. Total skills processed (created or existing): ${createdOrExistingSkills.length}`);
  return createdOrExistingSkills;
}

// Seed technologies
async function seedTechnologies() {
  console.log('Seeding technologies: Start');
  const techNamesAndCategories = [
    { name: 'React', category: 'Frontend' },
    { name: 'Angular', category: 'Frontend' },
    { name: 'Vue.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Django', category: 'Backend' },
    { name: 'Flask', category: 'Backend' },
    { name: 'Spring Boot', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Azure', category: 'Cloud' },
    { name: 'Google Cloud Platform', category: 'Cloud' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'Jenkins', category: 'DevOps' },
    { name: 'GitHub Actions', category: 'DevOps' },
    { name: 'Terraform', category: 'DevOps' },
    { name: 'Ansible', category: 'DevOps' },
    { name: 'Java', category: 'Language' },
    { name: 'Python', category: 'Language' },
    { name: 'JavaScript', category: 'Language' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'C#', category: 'Language' },
  ];

  const createdOrExistingTechnologies = [];

  const numTechnologiesToCreate = Math.min(SEED_COUNT.TECHNOLOGIES, techNamesAndCategories.length);

  if (SEED_COUNT.TECHNOLOGIES > techNamesAndCategories.length) {
    console.warn(
      `SEED_COUNT.TECHNOLOGIES (${SEED_COUNT.TECHNOLOGIES}) is greater than the number of unique technology names ` +
      `(${techNamesAndCategories.length}). Will only attempt to create/use ${techNamesAndCategories.length} unique technologies.`
    );
  }

  for (let i = 0; i < numTechnologiesToCreate; i++) {
    const currentTechData = techNamesAndCategories[i];
    const technologyPayload = {
      name: currentTechData.name,
      category: currentTechData.category,
    };

    try {
      const [insertedTechnology] = await db.insert(technologies)
        .values(technologyPayload)
        .returning();

      if (insertedTechnology && insertedTechnology.id) {
        createdOrExistingTechnologies.push(insertedTechnology);
      } else {
        console.error(`Failed to insert technology or retrieve ID for: ${technologyPayload.name}, but no error was thrown.`);
      }
    } catch (error: any) {
      // PostgreSQL error code for unique_violation is '23505'
      if (error.code === '23505' && error.constraint === 'technologies_name_key') { // <--- CORRECTED CONSTRAINT NAME
        console.warn(`Technology with name "${technologyPayload.name}" already exists (constraint: ${error.constraint}). Fetching existing.`);
        const [existingTech] = await db.select().from(technologies).where(eq(technologies.name, technologyPayload.name));
        if (existingTech) {
          createdOrExistingTechnologies.push(existingTech);
        } else {
          console.error(`Technology "${technologyPayload.name}" reported as duplicate, but could not be fetched.`);
        }
      } else {
        console.error(`Error inserting technology ${technologyPayload.name}:`, error);
        // Rethrow if it's an unexpected error, or handle as needed
        // throw error;
      }
    }
  }

  console.log(`Seeding technologies: End. Total technologies processed (created or existing): ${createdOrExistingTechnologies.length}`);
  return createdOrExistingTechnologies;
}

// Seed candidates
async function seedCandidates(departmentsData: any[]) {
  console.log('Seeding candidates: Start');
  const candidatesData = [];

  for (let i = 0; i < SEED_COUNT.CANDIDATES; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    const candidateRecord = {
      firstName,
      lastName,
      fullName,
      email: faker.internet.email({ firstName, lastName }),
      phone: generatePhoneNumber(),
      birthDate: faker.date.birthdate({ min: 20, max: 65, mode: 'age' }),
      city: faker.location.city(),
      country: faker.location.country(),
      notes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.7 }),
      hourlyRate: faker.helpers.maybe(() => faker.number.float({ min: 20, max: 150, precision: 2 }), { probability: 0.8 }),
      status: faker.helpers.arrayElement(['active', 'inactive', 'interviewing', 'hired', 'rejected']),
      role: faker.person.jobTitle(),
      departmentId: faker.helpers.maybe(() => {
        if (departmentsData.length > 0) {
          const department = getRandomItem(departmentsData);
          return department.id;
        }
        return null; // If no departments, callback returns null
      }, { probability: 0.8 }) ?? null, // Ensure final value is ID or null
    };

    const [insertedCandidate] = await db.insert(candidates)
      .values({
        fullName: candidateRecord.fullName,
        email: candidateRecord.email,
        phone: candidateRecord.phone,
        birthDate: candidateRecord.birthDate,
        city: candidateRecord.city,
        country: candidateRecord.country,
        notes: candidateRecord.notes,
        hourlyRate: candidateRecord.hourlyRate,
        status: candidateRecord.status,
        role: candidateRecord.role,
        departmentId: candidateRecord.departmentId,
        // If your 'candidates' table has firstName and lastName columns, add them here:
        // firstName: candidateRecord.firstName,
        // lastName: candidateRecord.lastName,
      })
      .returning({ id: candidates.id });

    if (insertedCandidate && insertedCandidate.id) {
      candidatesData.push({
        ...candidateRecord,
        id: insertedCandidate.id
      });
    } else {
      console.error(`Failed to insert candidate or retrieve ID for: ${candidateRecord.fullName}`);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`Processed ${i + 1} candidates...`);
    }
  }

  console.log(`Seeding candidates: End. Total candidates processed: ${candidatesData.length}`);
  return candidatesData;
}

// Seed employees
async function seedEmployees(candidatesData: any[], departmentsData: any[]) {
  console.log('Seeding employees: Start');
  const employeesData = [];
  const HIRE_CANDIDATES_PERCENTAGE = 50;
  const EMPLOYEES_TO_CREATE_DIRECTLY = 10;

  // Hire some candidates
  const candidatesToHireCount = Math.floor(candidatesData.length * (HIRE_CANDIDATES_PERCENTAGE / 100));
  const candidatesToHire = faker.helpers.arrayElements(candidatesData, candidatesToHireCount);

  for (const candidate of candidatesToHire) {
    if (!candidate || !candidate.id) {
      console.warn(`Skipping hiring for invalid candidate object: ${JSON.stringify(candidate)}`);
      continue;
    }

    let departmentId = candidate.departmentId;
    if (!departmentId && departmentsData.length > 0) {
      departmentId = getRandomItem(departmentsData).id;
    } else if (!departmentId) {
      console.warn(`Cannot assign department to hired candidate ${candidate.fullName} (ID: ${candidate.id}) as no departments are available and candidate had no pre-assigned department.`);
      // Decide if you want to skip or assign a default/null if schema allows
    }

    // Ensure candidate.role exists and is a string before using toLowerCase()
    const positionTitle = (candidate.role && typeof candidate.role === 'string')
      ? candidate.role
      : 'Associate'; // Default role if candidate.role is missing or not a string

    const isManager = (candidate.role && typeof candidate.role === 'string')
      ? candidate.role.toLowerCase().includes('manager')
      : false;

    const employeeData = {
      candidateId: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      birthDate: candidate.birthDate,
      hireDate: getRandomDate(
        new Date(Math.max(new Date(candidate.birthDate).getTime() + 18 * 365.25 * 24 * 60 * 60 * 1000, new Date(2015, 0, 1).getTime())), // At least 18 years after birthDate or 2015
        new Date()
      ),
      departmentId,
      position: positionTitle,
      salary: faker.number.int({ min: 40000, max: isManager ? 200000 : 120000 }),
      employmentType: faker.helpers.arrayElement(['full_time', 'part_time']),
      status: 'active', // Default status for hired candidates
      notes: candidate.notes || `Hired from candidate pool on ${new Date().toLocaleDateString()}.`,
      officeLocation: faker.location.city(),
      country: candidate.country || faker.location.country(),
      role: candidate.role || 'Developer',
    };

    const [insertedEmployee] = await db.insert(employees).values(employeeData).returning({ id: employees.id });
    if (insertedEmployee && insertedEmployee.id) {
      employeesData.push({ ...employeeData, id: insertedEmployee.id });
    } else {
      console.error(`Failed to insert employee (from candidate ${candidate.id}) or retrieve ID.`);
    }
  }

  // Create additional employees directly
  const directEmployeesToCreate = Math.max(0, EMPLOYEES_TO_CREATE_DIRECTLY - employeesData.length);
  for (let i = 0; i < directEmployeesToCreate; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const role = faker.person.jobTitle(); // Generate a role for direct employees

    let departmentId = null;
    if (departmentsData.length > 0) {
      departmentId = getRandomItem(departmentsData).id;
    } else {
      console.warn(`Cannot assign department to directly created employee ${fullName} as no departments are available.`);
      // Decide if you want to skip or assign a default/null if schema allows
    }

    const isManager = (role && typeof role === 'string')
      ? role.toLowerCase().includes('manager')
      : false;

    const employeeData = {
      firstName,
      lastName,
      fullName,
      email: faker.internet.email({ firstName, lastName }),
      phone: generatePhoneNumber(),
      birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      hireDate: getRandomDate(new Date(2015, 0, 1), new Date()),
      departmentId,
      position: role || 'Associate', // Use generated role or fallback
      salary: faker.number.int({ min: 40000, max: isManager ? 200000 : 120000 }),
      employmentType: faker.helpers.arrayElement(['full_time', 'part_time']),
      status: 'active',
      notes: faker.lorem.sentence(),
      officeLocation: faker.location.city(),
      country: faker.location.country(),
      candidateId: null, // Explicitly null for directly created employees
    };
    const [insertedEmployee] = await db.insert(employees).values(employeeData).returning({ id: employees.id });
    if (insertedEmployee && insertedEmployee.id) {
      employeesData.push({ ...employeeData, id: insertedEmployee.id });
    } else {
      console.error(`Failed to insert directly created employee or retrieve ID for: ${fullName}`);
    }
  }

  console.log(`Seeded ${employeesData.length} employees (${candidatesToHire.length} from candidates, ${directEmployeesToCreate} directly).`);
  console.log('Seeding employees: End');
  return employeesData;
}

// Seed positions
async function seedPositions(departmentsData: any[]) {
  console.log('Seeding positions: Start');
  const positionsData = [];

  const positionTitles = [
    'Software Engineer',
    'Senior Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Product Manager',
    'UX Designer',
    'UI Designer',
    'Marketing Specialist',
    'Sales Representative',
    'HR Specialist',
    'Financial Analyst',
    'Customer Support Specialist'
  ];

  const numPositionsToCreate = Math.min(SEED_COUNT.POSITIONS, positionTitles.length);

  if (numPositionsToCreate > 0 && departmentsData.length === 0) {
    console.warn('No departments available to assign to positions. Skipping position creation.');
    // No need to proceed if no departments are available for assignment
    console.log('Seeding positions: End');
    return positionsData; // Return empty array
  }

  for (let i = 0; i < numPositionsToCreate; i++) {
    // This check is now more robust due to the early exit above,
    // but kept for safety in case the logic changes.
    if (departmentsData.length === 0) {
      // This case should ideally be caught by the check before the loop
      console.warn('No departments available during position creation loop. This should not happen if initial check is in place.');
      break;
    }
    const department = getRandomItem(departmentsData);
    // At this point, department should be valid if departmentsData is not empty.

    const positionData = {
      title: positionTitles[i],
      departmentId: department.id, // department should be defined here
      description: faker.lorem.paragraphs(2),
      requirements: faker.lorem.paragraphs(1),
      status: faker.helpers.arrayElement(['open', 'filled', 'on_hold', 'closed']),
    };

    await db.insert(positions).values(positionData);
    positionsData.push({ ...positionData, id: i + 1 }); // Note: This ID is a temporary local ID, not the DB ID.
    // Consider .returning({ id: positions.id }) if DB ID is needed.
  }

  console.log(`Seeded ${positionsData.length} positions`);
  console.log('Seeding positions: End');
  return positionsData;
}

// Seed projects
async function seedProjects(clientsData: any[], employeesData: any[]) {
  console.log('Seeding projects: Start');
  const projectsData = [];

  if (SEED_COUNT.PROJECTS > 0 && clientsData.length === 0) {
    console.warn('No clients available to assign to projects. Skipping project creation.');
    console.log('Seeding projects: End');
    return projectsData; // Return empty array
  }

  if (SEED_COUNT.PROJECTS > 0 && employeesData.length === 0) {
    console.warn('No employees available to assign as project managers. Skipping project creation.');
    console.log('Seeding projects: End');
    return projectsData; // Return empty array
  }

  for (let i = 0; i < SEED_COUNT.PROJECTS; i++) {
    // These checks are now more robust due to the early exits above,
    // but kept for safety in case the logic changes or SEED_COUNT.PROJECTS is 0.
    if (clientsData.length === 0 || employeesData.length === 0) {
      console.warn('Skipping project creation due to missing clients or employees (this should have been caught earlier).');
      break;
    }

    const client = getRandomItem(clientsData);
    // Ensure client is not undefined (should be guaranteed by the checks above if SEED_COUNT.PROJECTS > 0)
    if (!client) {
      console.error('Critical error: Client is undefined despite checks. Skipping project iteration.');
      continue;
    }

    // Ensure employeesData is not empty before trying to pick a manager
    let projectManager = null;
    if (employeesData.length > 0) {
      const potentialManagers = employeesData.filter(e => e.position?.toLowerCase().includes('manager') || faker.datatype.boolean(0.3));
      projectManager = potentialManagers.length > 0 ? getRandomItem(potentialManagers) : getRandomItem(employeesData);
    }

    if (!projectManager) {
      console.error(`Critical error: Project manager could not be selected for project ${i + 1} (client: ${client.name}). Skipping this project.`);
      continue;
    }


    const startDate = getRandomDate(new Date(2020, 0, 1), new Date());
    const endDate = faker.helpers.maybe(
      () => getRandomDate(startDate, new Date(2025, 11, 31)),
      { probability: 0.7 }
    );

    const projectData = {
      name: faker.company.catchPhrase(),
      industry: client.industry, // client should be defined here
      description: faker.lorem.paragraphs(2),
      budget: faker.number.float({ min: 10000, max: 500000, precision: 2 }),
      startDate,
      endDate,
      employmentType: faker.helpers.arrayElement(['full_time', 'part_time', 'contractor']),
      status: faker.helpers.arrayElement(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']),
      clientId: client.id, // client.id should be safe now
      projectManagerId: projectManager.id, // projectManager.id should be safe now
      notes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.6 }),
    };

    await db.insert(projects).values(projectData);
    projectsData.push({ ...projectData, id: i + 1 }); // Using temporary local ID
  }

  console.log(`Seeded ${projectsData.length} projects`);
  console.log('Seeding projects: End');
  return projectsData;
}

// Seed education
async function seedEducation(candidatesData: any[], employeesData: any[]) {
  console.log('Seeding education: Start');
  const educationData = [];

  // Add education for candidates
  for (const candidate of candidatesData) {
    const educationCount = faker.number.int({ min: 1, max: SEED_COUNT.EDUCATION_PER_PERSON });

    for (let i = 0; i < educationCount; i++) {
      const startDate = getRandomDate(
        new Date(new Date().getFullYear() - 15, 0, 1),
        new Date(new Date().getFullYear() - 5, 0, 1)
      );

      const graduationDate = getRandomDate(
        new Date(startDate.getTime() + 31536000000), // +1 year
        new Date(startDate.getTime() + 157680000000) // +5 years
      );

      const educationRecord = {
        candidateId: candidate.id,
        institution: faker.company.name() + ' University',
        degree: faker.helpers.arrayElement(['Bachelor', 'Master', 'PhD', 'Associate']),
        fieldOfStudy: faker.helpers.arrayElement([
          'Computer Science', 'Information Technology', 'Software Engineering',
          'Business Administration', 'Marketing', 'Finance', 'Design'
        ]),
        startDate,
        graduationDate,
      };

      await db.insert(education).values(educationRecord);
      educationData.push({ ...educationRecord, id: educationData.length + 1 });
    }
  }

  // Add education for employees
  for (const employee of employeesData) {
    // Skip if the employee was a candidate (to avoid duplication)
    if (employee.candidateId) continue;

    const educationCount = faker.number.int({ min: 1, max: SEED_COUNT.EDUCATION_PER_PERSON });

    for (let i = 0; i < educationCount; i++) {
      const startDate = getRandomDate(
        new Date(new Date().getFullYear() - 20, 0, 1),
        new Date(new Date().getFullYear() - 5, 0, 1)
      );

      const graduationDate = getRandomDate(
        new Date(startDate.getTime() + 31536000000), // +1 year
        new Date(startDate.getTime() + 157680000000) // +5 years
      );

      const educationRecord = {
        employeeId: employee.id,
        institution: faker.company.name() + ' University',
        degree: faker.helpers.arrayElement(['Bachelor', 'Master', 'PhD', 'Associate']),
        fieldOfStudy: faker.helpers.arrayElement([
          'Computer Science', 'Information Technology', 'Software Engineering',
          'Business Administration', 'Marketing', 'Finance', 'Design'
        ]),
        startDate,
        graduationDate,
      };

      await db.insert(education).values(educationRecord);
      educationData.push({ ...educationRecord, id: educationData.length + 1 });
    }
  }

  console.log(`Seeded ${educationData.length} education records`);
  console.log('Seeding education: End');
  return educationData;
}

// Seed work experience
async function seedWorkExperience(persons: any[], personType: 'candidate' | 'employee') {
  console.log(`Seeding work experience for ${personType}s: Start`);
  if (persons.length === 0) {
    console.log(`No ${personType}s to seed work experience for. Skipping.`);
    console.log(`Seeding work experience for ${personType}s: End`);
    return;
  }

  for (const person of persons) {
    if (!person || !person.id) {
      console.warn(`Skipping work experience for invalid person object: ${JSON.stringify(person)}`);
      continue;
    }

    for (let j = 0; j < SEED_COUNT.WORK_EXPERIENCE_PER_PERSON; j++) {
      const startDate = getRandomDate(new Date(2010, 0, 1), new Date());
      const isCurrentJob = j === 0 && faker.datatype.boolean(0.7); // Make the first job more likely to be current
      const endDate = isCurrentJob ? null : getRandomDate(startDate, new Date());

      const generatedJobTitle = faker.person.jobTitle();
      if (!generatedJobTitle) {
        console.warn(`Faker generated a null or empty job title for person ID ${person.id}. Using fallback.`);
      }

      // Base data common to all work experience
      const baseWorkExperienceData = {
        companyName: faker.company.name(),
        jobTitle: generatedJobTitle || 'Unknown Job Title',
        location: faker.location.city(),
        country: faker.location.country(),
        startDate,
        endDate,
        isCurrent: isCurrentJob || !endDate,
        employmentType: faker.helpers.arrayElement(['full_time', 'part_time', 'contract', 'internship']) as 'full_time' | 'part_time' | 'contract' | 'internship',
        description: faker.lorem.paragraph(),
      };

      let finalWorkExperienceData: any; // Use 'any' or a more specific type if defined

      if (personType === 'candidate') {
        finalWorkExperienceData = {
          ...baseWorkExperienceData,
          candidateId: person.id, // Assuming schema field is candidateId
          // If your table also has a person_type column, you might add:
          // personType: 'candidate',
        };
      } else if (personType === 'employee') {
        finalWorkExperienceData = {
          ...baseWorkExperienceData,
          employeeId: person.id, // Assuming schema field is employeeId
          // If your table also has a person_type column, you might add:
          // personType: 'employee',
        };
      } else {
        // This case should not be reached if personType is correctly 'candidate' | 'employee'
        console.error(`Invalid personType "${personType}" for person ID ${person.id}. Skipping work experience entry.`);
        continue;
      }

      try {
        await db.insert(workExperience).values(finalWorkExperienceData);
      } catch (error) {
        console.error(`Error inserting work experience for person ${person.id} (${personType}):`, error);
        console.error('Attempted work experience data:', finalWorkExperienceData);
      }
    }
  }
  console.log(`Seeding work experience for ${personType}s: End`);
}

// Seed candidate skills
async function seedCandidateSkills(candidatesData: any[], skillsData: any[]) {
  console.log('Seeding candidate skills: Start');
  const candidateSkillsData = [];

  for (const candidate of candidatesData) {
    // Assign 1-5 random skills to each candidate
    const candidateSkillsCount = faker.number.int({ min: 1, max: 5 });
    const selectedSkills = faker.helpers.arrayElements(skillsData, candidateSkillsCount);

    for (const skill of selectedSkills) {
      const candidateSkillData = {
        candidateId: candidate.id,
        skillId: skill.id,
        proficiencyLevel: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
        yearsOfExperience: faker.number.int({ min: 1, max: 10 }),
      };

      await db.insert(candidateSkills).values(candidateSkillData);
      candidateSkillsData.push(candidateSkillData);
    }
  }

  console.log(`Seeded ${candidateSkillsData.length} candidate skills`);
  console.log('Seeding candidate skills: End');
  return candidateSkillsData;
}

// Seed employee skills
async function seedEmployeeSkills(employeesData: any[], skillsData: any[]) {
  console.log('Seeding employee skills: Start');
  const employeeSkillsData = [];

  for (const employee of employeesData) {
    // Assign 2-7 random skills to each employee
    const employeeSkillsCount = faker.number.int({ min: 2, max: 7 });
    const selectedSkills = faker.helpers.arrayElements(skillsData, employeeSkillsCount);

    for (const skill of selectedSkills) {
      const yearsOfExperience = faker.number.int({ min: 1, max: 10 });
      const isCertified = faker.helpers.maybe(() => true, { probability: 0.3 });

      const employeeSkillData = {
        employeeId: employee.id,
        skillId: skill.id,
        proficiencyLevel: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
        yearsOfExperience,
        isCertified,
        certificationName: isCertified ? `${skill.name} Professional Certification` : null,
        certificationDate: isCertified ? getRandomDate(new Date(2018, 0, 1), new Date()) : null,
      };

      await db.insert(employeeSkills).values(employeeSkillData);
      employeeSkillsData.push(employeeSkillData);
    }
  }

  console.log(`Seeded ${employeeSkillsData.length} employee skills`);
  console.log('Seeding employee skills: End');
  return employeeSkillsData;
}

// Seed project technologies
async function seedProjectTechnologies(projectsData: any[], technologiesData: any[]) {
  console.log('Seeding project technologies: Start');
  const projectTechnologiesData = [];

  for (const project of projectsData) {
    // Assign 2-5 technologies to each project
    const techCount = faker.number.int({ min: 2, max: 5 });
    const selectedTechnologies = faker.helpers.arrayElements(technologiesData, techCount);

    // Mark one as primary
    const primaryTechIndex = faker.number.int({ min: 0, max: selectedTechnologies.length - 1 });

    for (let i = 0; i < selectedTechnologies.length; i++) {
      const tech = selectedTechnologies[i];
      const isPrimary = i === primaryTechIndex;

      const projectTechData = {
        projectId: project.id,
        technologyId: tech.id,
        proficiencyRequired: faker.helpers.arrayElement(['Basic', 'Intermediate', 'Advanced']),
        isPrimary,
      };

      await db.insert(projectTechnologies).values(projectTechData);
      projectTechnologiesData.push(projectTechData);
    }
  }

  console.log(`Seeded ${projectTechnologiesData.length} project technologies`);
  console.log('Seeding project technologies: End');
  return projectTechnologiesData;
}

// Seed project team members
async function seedProjectTeamMembers(projectsData: any[], employeesData: any[]) {
  console.log('Seeding project team members: Start');
  const projectTeamMembersData = [];

  if (projectsData.length === 0) {
    console.warn('No projects available to assign team members to. Skipping project team member creation.');
    console.log('Seeding project team members: End');
    return projectTeamMembersData;
  }

  if (employeesData.length === 0) {
    console.warn('No employees available to assign as team members. Skipping project team member creation.');
    console.log('Seeding project team members: End');
    return projectTeamMembersData;
  }

  for (const project of projectsData) {
    if (!project || !project.id || !project.startDate) {
      console.warn(`Skipping team members for invalid project object or project missing startDate: ${JSON.stringify(project)}`);
      continue;
    }

    const MAX_TEAM_MEMBERS_PER_PROJECT = 5;
    const MAX_PROJECT_MEMBER_DURATION_YEARS = 1;
    const PROBABILITY_MEMBER_HAS_END_DATE = 0.5;
    const teamSize = faker.number.int({ min: 1, max: Math.min(MAX_TEAM_MEMBERS_PER_PROJECT, employeesData.length) });
    const selectedEmployees = faker.helpers.arrayElements(employeesData, teamSize);

    if (selectedEmployees.length === 0 && teamSize > 0) {
      console.warn(`Project ${project.id}: Wanted to assign ${teamSize} members, but no employees were selected (possibly due to small employee pool).`);
      continue;
    }

    for (const employee of selectedEmployees) {
      if (!employee || !employee.id) {
        console.warn(`Skipping assignment for invalid employee object: ${JSON.stringify(employee)}`);
        continue;
      }

      const projectStartDate = new Date(project.startDate); // Ensure it's a Date object
      const projectEndDate = project.endDate ? new Date(project.endDate) : null; // Ensure it's a Date object or null

      let latestValidMemberStartDate = new Date(); // Today
      if (projectEndDate && projectEndDate < latestValidMemberStartDate) {
        latestValidMemberStartDate = projectEndDate;
      }

      if (projectStartDate.getTime() > latestValidMemberStartDate.getTime()) {
        console.warn(`Project ${project.id} (P_Start: ${projectStartDate.toISOString()}, P_End: ${projectEndDate?.toISOString()}) has an invalid date range for adding team members relative to today. Earliest member start (${projectStartDate.toISOString()}) is after latest possible start (${latestValidMemberStartDate.toISOString()}). Skipping member ${employee.id}.`);
        continue;
      }

      const memberStartDate = getRandomDate(projectStartDate, latestValidMemberStartDate);

      let memberEndDate = null;
      if (projectEndDate) {
        if (memberStartDate.getTime() <= projectEndDate.getTime()) {
          memberEndDate = getRandomDate(memberStartDate, projectEndDate);
        } else {
          console.warn(`Project ${project.id}, Member ${employee.id}: memberStartDate (${memberStartDate.toISOString()}) is after projectEndDate (${projectEndDate.toISOString()}). Setting memberEndDate to memberStartDate.`);
          memberEndDate = memberStartDate;
        }
      } else {
        memberEndDate = faker.helpers.maybe(
          () => getRandomDate(memberStartDate, new Date(memberStartDate.getFullYear() + MAX_PROJECT_MEMBER_DURATION_YEARS, memberStartDate.getMonth(), memberStartDate.getDate())),
          { probability: PROBABILITY_MEMBER_HAS_END_DATE }
        );
      }

      if (memberEndDate && memberStartDate.getTime() > memberEndDate.getTime()) {
        console.warn(`Project ${project.id}, Member ${employee.id}: Corrected memberEndDate as it was before memberStartDate. Initial start: ${memberStartDate.toISOString()}, initial end: ${memberEndDate.toISOString()}. Setting end to start.`);
        memberEndDate = memberStartDate;
      }

      const projectTeamMemberData = {
        projectId: project.id,
        employeeId: employee.id,
        role: faker.person.jobTitle(),
        assignedAt: memberStartDate, // Use memberStartDate
        removedAt: memberEndDate,   // Use memberEndDate
        hoursPerWeek: faker.number.int({ min: 10, max: 40 }),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }),
      };

      try {
        const [insertedPtm] = await db.insert(projectTeamMembers)
          .values(projectTeamMemberData)
          .returning();
        if (insertedPtm) {
          projectTeamMembersData.push(insertedPtm);
        } else {
          console.error(`Failed to insert project team member for project ${project.id}, employee ${employee.id} or retrieve result.`);
        }
      } catch (error) {
        console.error(`Error inserting project team member for project ${project.id}, employee ${employee.id}:`, error);
        console.error('Attempted data:', projectTeamMemberData);
      }
    }
  }

  console.log(`Seeded ${projectTeamMembersData.length} project team members`);
  console.log('Seeding project team members: End');
  return projectTeamMembersData;
}

// Seed meetings
async function seedMeetings(
  employeesData: any[],
  candidatesData: any[],
  positionsData: any[],
  projectsData: any[],
) {
  console.log('Seeding meetings: Start');
  const meetingsData = [];
  const meetingTypes = ['Interview', 'Team Meeting', 'Client Call', 'Project Kickoff', 'Performance Review'];


  if (SEED_COUNT.MEETINGS === 0) {
    console.log('SEED_COUNT.MEETINGS is 0. Skipping meeting creation.');
    console.log('Seeding meetings: End');
    return meetingsData;
  }

  if (employeesData.length === 0) {
    console.warn('No employees available to create meetings. Skipping meeting creation.');
    console.log('Seeding meetings: End');
    return meetingsData;
  }

  for (let i = 0; i < SEED_COUNT.MEETINGS; i++) {
    const createdByEmployee = getRandomItem(employeesData);

    if (!createdByEmployee || !createdByEmployee.id) {
      console.warn('Could not select a valid employee to create a meeting. Skipping this meeting instance.');
      continue;
    }

    const meetingType = getRandomItem(meetingTypes);
    const baseStartTime = getRandomDate(new Date(), new Date(new Date().getFullYear() + 1, 11, 31));
    // Ensure generated dates are valid Date objects
    const generatedStartTime = faker.date.soon({ days: 30, refDate: baseStartTime });
    const generatedEndTime = new Date(generatedStartTime.getTime() + faker.number.int({ min: 30, max: 120 }) * 60000); // 30 mins to 2 hours later

    let relatedCandidateId = null;
    let relatedPositionId = null;
    let relatedProjectId = null;

    if (meetingType === 'Interview') {
      if (positionsData.length > 0 && candidatesData.length > 0) {
        const position = getRandomItem(positionsData);
        const candidate = getRandomItem(candidatesData);
        if (position && position.id) {
          relatedPositionId = position.id;
        } else {
          console.warn('Could not assign a valid position for an Interview meeting or position.id was missing.');
        }
        if (candidate && candidate.id) {
          relatedCandidateId = candidate.id;
        } else {
          console.warn('Could not assign a valid candidate for an Interview meeting or candidate.id was missing.');
        }
      } else {
        console.warn(`Skipping Interview-specific details for meeting due to insufficient data: positions available: ${positionsData.length}, candidates available: ${candidatesData.length}.`);
      }
    } else if ((meetingType === 'Project Kickoff' || meetingType === 'Client Call')) {
      if (projectsData.length > 0) {
        const project = getRandomItem(projectsData);
        if (project && project.id) {
          relatedProjectId = project.id;
        } else {
          console.warn(`Could not assign a valid project for ${meetingType} meeting or project.id was missing.`);
        }
      } else {
        console.warn(`Skipping ${meetingType}-specific details for meeting due to insufficient data: projects available: ${projectsData.length}.`);
      }
    }

    const meetingData = {
      title: `${meetingType}: ${faker.lorem.words(3)}`,
      description: faker.lorem.sentence(),
      meetingType,
      // Ensure keys match Drizzle schema for 'start_datetime' and 'end_datetime' columns
      startDatetime: generatedStartTime, // Changed from startTime
      endDatetime: generatedEndTime,     // Changed from endTime
      location: faker.helpers.arrayElement(['Office A', 'Office B', 'Online', faker.location.streetAddress()]),
      createdById: createdByEmployee.id,
      relatedCandidateId,
      relatedPositionId,
      relatedProjectId,
      status: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled']) as 'scheduled' | 'completed' | 'cancelled',
    };

    try {
      const [insertedMeeting] = await db.insert(meetings)
        .values(meetingData)
        .returning();
      if (insertedMeeting) {
        meetingsData.push(insertedMeeting);
      } else {
        console.error(`Failed to insert meeting or retrieve result for meeting created by ${createdByEmployee.id}.`);
      }
    } catch (error) {
      console.error(`Error inserting meeting for creator ${createdByEmployee.id}:`, error);
      console.error('Attempted data:', meetingData);
    }
  }

  console.log(`Seeded ${meetingsData.length} meetings`);
  console.log('Seeding meetings: End');
  return meetingsData;
}

// Seed meeting participants
async function seedMeetingParticipants(
  meetingsData: any[],
  employeesData: any[],
  candidatesData: any[],
  clientsData: any[],
) {
  console.log('Seeding meeting participants: Start');
  const meetingParticipantsData = [];

  if (meetingsData.length === 0) {
    console.warn('No meetings available to add participants to. Skipping.');
    console.log('Seeding meeting participants: End');
    return meetingParticipantsData;
  }

  for (const meeting of meetingsData) {
    if (!meeting || !meeting.id) {
      console.warn(`Skipping participants for invalid meeting object: ${JSON.stringify(meeting)}`);
      continue;
    }

    const MAX_PARTICIPANTS_PER_MEETING = 5;

    const participantCount = faker.number.int({ min: 1, max: MAX_PARTICIPANTS_PER_MEETING || 5 });
    const addedParticipantsForThisMeeting = new Set(); // To avoid duplicates in the same meeting

    for (let i = 0; i < participantCount; i++) {
      const participantType = faker.helpers.arrayElement(['employee', 'candidate', 'client']);
      let employeeId = null;
      let candidateId = null;
      let clientId = null;
      let participantKey = ''; // For duplicate checking

      if (participantType === 'employee' && employeesData.length > 0) {
        const selectedEmployee = getRandomItem(employeesData);
        if (selectedEmployee && selectedEmployee.id) {
          employeeId = selectedEmployee.id;
          participantKey = `emp-${employeeId}`;
        }
      } else if (participantType === 'candidate' && candidatesData.length > 0) {
        const selectedCandidate = getRandomItem(candidatesData);
        if (selectedCandidate && selectedCandidate.id) {
          candidateId = selectedCandidate.id;
          participantKey = `cand-${candidateId}`;
        }
        // If it's an interview, ensure the related candidate is a participant (if not already added)
        if (meeting.meetingType === 'Interview' && meeting.relatedCandidateId && !addedParticipantsForThisMeeting.has(`cand-${meeting.relatedCandidateId}`)) {
          candidateId = meeting.relatedCandidateId;
          participantKey = `cand-${candidateId}`;
          // Reset employee/client if we are forcing this candidate
          employeeId = null;
          clientId = null;
        }
      } else if (participantType === 'client' && clientsData.length > 0) {
        const selectedClient = getRandomItem(clientsData);
        if (selectedClient && selectedClient.id) {
          clientId = selectedClient.id;
          participantKey = `cli-${clientId}`;
        }
      }

      // Fallback to employee if other types are not available or suitable, and no participant was set
      if (!employeeId && !candidateId && !clientId) {
        if (employeesData.length > 0) {
          const fallbackEmployee = getRandomItem(employeesData);
          if (fallbackEmployee && fallbackEmployee.id) {
            employeeId = fallbackEmployee.id;
            participantKey = `emp-${employeeId}`;
          } else {
            continue; // Skip if no employees to assign as fallback
          }
        } else {
          continue; // Skip if no participants could be assigned
        }
      }

      // Ensure at least one ID is set (should be guaranteed by above logic if employeesData is not empty)
      if (!employeeId && !candidateId && !clientId) continue;

      // Avoid duplicate participants in the same meeting
      if (participantKey && addedParticipantsForThisMeeting.has(participantKey)) {
        continue;
      }
      if (participantKey) {
        addedParticipantsForThisMeeting.add(participantKey);
      }


      const meetingParticipantData = {
        meetingId: meeting.id,
        participantType: employeeId ? 'employee' : (candidateId ? 'candidate' : 'client'), // Determine actual type
        employeeId,
        candidateId,
        clientId,
        role: faker.helpers.maybe(() => faker.person.jobTitle(), { probability: 0.5 }),
        status: faker.helpers.arrayElement(['Accepted', 'Declined', 'Tentative', 'Needs Action']) as 'Accepted' | 'Declined' | 'Tentative' | 'Needs Action',
      };

      try {
        // This is where the error occurs if 'meetingParticipants' table/relation doesn't exist
        const [insertedParticipant] = await db.insert(meetingParticipants)
          .values(meetingParticipantData)
          .returning(); // Assuming you want to return the inserted data
        if (insertedParticipant) {
          meetingParticipantsData.push(insertedParticipant);
        } else {
          console.error(`Failed to insert meeting participant or retrieve result for meeting ${meeting.id}. Data: ${JSON.stringify(meetingParticipantData)}`);
        }
      } catch (error) {
        console.error(`Error inserting meeting participant for meeting ${meeting.id}:`, error);
        console.error('Attempted data:', meetingParticipantData);
        // If the error is "relation does not exist", rethrowing might be appropriate
        // as it's a fundamental setup issue.
        // if ((error as any).code === '42P01') throw error;
      }
    }
  }

  console.log(`Seeded ${meetingParticipantsData.length} meeting participants`);
  console.log('Seeding meeting participants: End');
  return meetingParticipantsData;
}

// async function seedRolesLegacy(departmentsData: any[]) {
//   console.log('Seeding legacy roles: Start');
//   const rolesData = [];
//   const departmentRoles: Record<string, string[]> = {
//     Sales: ['Sales Representative', 'Account Executive', 'Sales Manager'],
//     Marketing: ['Marketing Specialist', 'Social Media Manager', 'Content Writer'],
//     Engineering: [
//       'Software Engineer',
//       'DevOps Engineer',
//       'QA Engineer',
//       'Frontend Developer',
//       'Backend Developer',
//     ],
//     HR: ['HR Specialist', 'Recruiter', 'Talent Acquisition Manager'],
//     Finance: ['Accountant', 'Financial Analyst', 'Payroll Specialist'],
//   };

//   for (const department of departmentsData) {
//     const departmentName = department.name;
//     const possibleRoles = departmentRoles[departmentName] || ['Generic Role', 'Associate'];
//     const numberOfRoles = faker.number.int({ min: 1, max: 3 });

//     for (let i = 0; i < numberOfRoles; i++) {
//       const roleTitle = possibleRoles[i % possibleRoles.length];
//       const roleData = {
//         title: roleTitle,
//         departmentId: department.id, // Assuming departmentsData has IDs from the new seedDepartments
//       };
//       await db.insert(roles).values(roleData);
//       rolesData.push({ ...roleData, id: rolesData.length + 1 });
//       console.log(`Created legacy role: ${roleTitle} in ${departmentName}`);
//     }
//   }
//   console.log('Seeding legacy roles: End');
//   return rolesData;
// }

// async function seedApplicantsLegacy() {
//   console.log('Seeding legacy applicants: Start');
//   const applicantsData = [];
//   for (let i = 0; i < SEED_COUNT.APPLICANTS; i++) {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const applicantData = {
//       firstName,
//       lastName,
//       email: faker.internet.email({ firstName, lastName }),
//       phone: generatePhoneNumber(),
//       resumeUrl: faker.helpers.maybe(
//         () => `https://storage.example.com/resumes/${faker.system.commonFileName('pdf')}`,
//         { probability: 0.8 }
//       ),
//     };
//     await db.insert(applicants).values(applicantData);
//     applicantsData.push({ ...applicantData, id: i + 1 });
//     if (i % 10 === 0) console.log(`Created ${i} legacy applicants...`);
//   }
//   console.log('Seeding legacy applicants: End');
//   return applicantsData;
// }

// async function seedApplicationsLegacy(applicantsData: any[], rolesData: any[]) {
//   console.log('Seeding legacy applications: Start');
//   const applicationsData = [];
//   const applicationStatusCounts: Record<string, Record<string, number>> = {}; // For metrics

//   if (applicantsData.length === 0 || rolesData.length === 0) {
//     console.log('Skipping legacy applications seeding due to missing applicants or roles.');
//     return { applicationsData, applicationStatusCounts };
//   }

//   const startDate = new Date('2023-01-01');
//   const endDate = new Date();

//   for (const applicant of applicantsData) {
//     const numberOfApplications = faker.number.int({ min: 1, max: 2 });
//     const selectedRoles = faker.helpers.arrayElements(rolesData, numberOfApplications);

//     for (const role of selectedRoles) {
//       const appliedDate = getRandomDate(startDate, endDate);
//       const monthKey = `${appliedDate.getFullYear()}-${String(appliedDate.getMonth() + 1).padStart(2, '0')}`;

//       if (!applicationStatusCounts[monthKey]) {
//         applicationStatusCounts[monthKey] = {
//           applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0,
//           inProgress: 0, completed: 0,
//         };
//       }

//       const { status, dates } = generateApplicationStatusDates(appliedDate);
//       applicationStatusCounts[monthKey][status]++;
//       if (status === 'offer' || status === 'rejected') {
//         applicationStatusCounts[monthKey].completed++;
//       } else {
//         applicationStatusCounts[monthKey].inProgress++;
//       }

//       const notes = faker.helpers.maybe(() => faker.lorem.paragraph().substring(0, 499), { probability: 0.7 });
//       const applicationData = {
//         applicantId: applicant.id,
//         roleId: role.id,
//         status,
//         inProgress: status !== 'offer' && status !== 'rejected',
//         notes,
//         ...dates,
//       };
//       await db.insert(applications).values(applicationData);
//       applicationsData.push({ ...applicationData, id: applicationsData.length + 1 });
//     }
//   }
//   console.log('Seeding legacy applications: End');
//   return { applicationsData, applicationStatusCounts };
// }

// async function seedApplicationMetricsLegacy(statusCounts: Record<string, Record<string, number>>) {
//   console.log('Seeding legacy application metrics: Start');
//   if (Object.keys(statusCounts).length === 0) {
//     console.log('No application status counts to seed for metrics.');
//     return;
//   }
//   for (const monthKey in statusCounts) {
//     const [year, month] = monthKey.split('-').map(Number);
//     const counts = statusCounts[monthKey];
//     const metricData = {
//       month: new Date(year, month - 1, 1), // JS months are 0-indexed
//       applied_count: counts.applied || 0,
//       screening_count: counts.screening || 0,
//       interview_count: counts.interview || 0,
//       offer_count: counts.offer || 0,
//       rejected_count: counts.rejected || 0,
//       completed_count: counts.completed || 0,
//       in_progress_count: counts.inProgress || 0,
//       remaining_count: (counts.applied || 0) - (counts.completed || 0), // Example calculation
//     };
//     await db.insert(applicationMetrics).values(metricData);
//   }
//   console.log('Seeding legacy application metrics: End');
// }

// async function seedEmployeeStatsLegacy(departmentsData: any[], employeesData: any[]) {
//   console.log('Seeding legacy employee stats: Start');
//   if (departmentsData.length === 0 || employeesData.length === 0) {
//     console.log('Skipping legacy employee stats due to missing departments or employees.');
//     return;
//   }

//   const startDate = new Date(new Date().getFullYear() - 1, 0, 1); // Start from 1 year ago
//   const endDate = new Date();

//   for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
//     const monthDate = new Date(d.getFullYear(), d.getMonth(), 1);

//     for (const department of departmentsData) {
//       const departmentEmployees = employeesData.filter(emp => emp.departmentId === department.id);
//       const fullTimeCount = departmentEmployees.filter(emp => emp.employeeType === 'full_time').length;
//       const partTimeCount = departmentEmployees.filter(emp => emp.employeeType === 'part_time').length;
//       const contractorCount = departmentEmployees.filter(emp => emp.employeeType === 'contractor').length;

//       const statData = {
//         month: monthDate,
//         departmentId: department.id,
//         full_time_count: fullTimeCount,
//         part_time_count: partTimeCount,
//         contractor_count: contractorCount,
//         total_count: fullTimeCount + partTimeCount + contractorCount,
//       };
//       await db.insert(employeeStats).values(statData);
//     }
//   }
//   console.log('Seeding legacy employee stats: End');
// }


// Main seeding function
async function main() {
  console.log('Starting database seed process...');

  // Seed core entities
  const departmentsData = await seedDepartments();
  const clientsData = await seedClients();
  const skillsData = await seedSkills();
  const technologiesData = await seedTechnologies();

  // Seed people (candidates and employees)
  // Pass departmentsData for assigning departmentId
  const candidatesData = await seedCandidates(departmentsData);
  // Pass candidatesData to potentially convert some to employees, and departmentsData
  // Use the new variable name for the returned data from seedEmployees
  const employeesData = await seedEmployees(candidatesData, departmentsData); // Changed from employeesData
  // const potentialManagers = employeesData.filter(e => e.position.toLowerCase().includes('manager') || faker.datatype.boolean(0.3));

  // // Update departments with managers if employees are available
  // if (departmentsData.length > 0 && employeesData.length > 0) {
  //   for (const dept of departmentsData) {
  //     if (faker.datatype.boolean(0.7)) { // 70% chance to have a manager
  //       // ... logic to find manager ...
  //       const manager = getRandomItem(potentialManagers);
  //       if (manager && manager.id) {
  //         // This is likely line 1236 or around it
  //         await db.update(departments)
  //           .set({ managerId: manager.id })
  //           .where(eq(departments.id, dept.id)); // <--- PROBLEM AREA
  //         console.log(`Assigned manager ${manager.fullName} (ID: ${manager.id}) to department ${dept.name}`);
  //       }
  //     }
  //   }
  // }

  const createdDepartments = await seedDepartments();

  // Seed positions, linking to departments
  const positionsData = await seedPositions(departmentsData);

  // Seed projects, linking to clients and employees (as managers)
  const projectsData = await seedProjects(clientsData, employeesData);

  const createdCandidates = await seedCandidates(createdDepartments);
  const createdEmployees = await seedEmployees(createdCandidates, createdDepartments);

  // Seed education and work experience for candidates and employees
  await seedEducation(candidatesData, employeesData);
  if (createdCandidates.length > 0) {
    await seedWorkExperience(createdCandidates, 'candidate');
  }
  if (createdEmployees.length > 0) {
    await seedWorkExperience(createdEmployees, 'employee'); // <--- ENSURE 'employee' STRING
  }


  // Seed skills and technologies linking tables
  await seedCandidateSkills(candidatesData, skillsData);
  await seedEmployeeSkills(employeesData, skillsData);
  await seedProjectTechnologies(projectsData, technologiesData);
  await seedProjectTeamMembers(projectsData, employeesData);

  // Seed meetings and participants
  const meetingsData = await seedMeetings(employeesData, candidatesData, positionsData, projectsData);
  await seedMeetingParticipants(meetingsData, employeesData, candidatesData, clientsData);

  console.log('Database seed process completed successfully!');
}

main().catch((err) => {
  console.error('Error during database seed:', err);
  process.exit(1);
});