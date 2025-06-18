import { relations } from 'drizzle-orm';
import { candidates } from './candidates.schema';
import { employees } from './employees.schema';
import { departments } from './departments.schema';
import { meetings } from './meetings.schema';
import { meetingParticipants } from './meeting-participants.schema';
import { clients } from './clients.schema';
import { projects } from './projects.schema';
import { technologies } from './technologies.schema';
import { projectTechnologies } from './project-technologies.schema';
import { projectTeamMembers } from './project-team-members.schema';
import { skills } from './skills.schema';
import { employeeSkills } from './employee-skills.schema';
import { candidateSkills } from './candidate-skills.schema';
import { education } from './education.schema';
import { workExperience } from './work-experience.schema';
import { positions } from './positions.schema';

// Candidates relations
export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  department: one(departments, {
    fields: [candidates.departmentId],
    references: [departments.id],
  }),
  employee: one(employees, {
    fields: [candidates.id],
    references: [employees.candidateId],
  }),
  skills: many(candidateSkills),
  education: many(education),
  workExperience: many(workExperience),
  meetings: many(meetings, { relationName: 'candidateMeetings' }),
  meetingParticipations: many(meetingParticipants, { relationName: 'candidateParticipations' }),
}));

// Employees relations
export const employeesRelations = relations(employees, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [employees.candidateId],
    references: [candidates.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
    relationName: 'employeeDepartment',
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: 'managerRelation',
  }),
  directReports: many(employees, {
    //@ts-expect-error Error with the relation name
    fields: [employees.id],
    references: [employees.managerId],
    relationName: 'managerRelation',
  }),
  managedDepartment: one(departments, {
    fields: [employees.id],
    references: [departments.managerId],
    relationName: 'departmentManager',
  }),
  skills: many(employeeSkills),
  education: many(education),
  workExperience: many(workExperience),
  createdMeetings: many(meetings, {
    relationName: 'meetingCreator',
  }),
  meetingParticipations: many(meetingParticipants, {
    relationName: 'employeeParticipations'
  }),
  managedProjects: many(projects, {
    relationName: 'projectManager',
  }),
  projectAssignments: many(projectTeamMembers),
}));

// Departments relations
export const departmentsRelations = relations(departments, ({ one, many }) => ({
  manager: one(employees, {
    fields: [departments.managerId],
    references: [employees.id],
    relationName: 'departmentManager',
  }),
  employees: many(employees, {
    relationName: 'employeeDepartment',
  }),
  candidates: many(candidates),
  positions: many(positions),
}));

// Meetings relations
export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  createdBy: one(employees, {
    fields: [meetings.createdById],
    references: [employees.id],
    relationName: 'meetingCreator',
  }),
  relatedPosition: one(positions, {
    fields: [meetings.relatedPositionId],
    references: [positions.id],
  }),
  relatedCandidate: one(candidates, {
    fields: [meetings.relatedCandidateId],
    references: [candidates.id],
    relationName: 'candidateMeetings',
  }),
  relatedProject: one(projects, {
    fields: [meetings.relatedProjectId],
    references: [projects.id],
  }),
  participants: many(meetingParticipants),
}));

// Meeting Participants relations
export const meetingParticipantsRelations = relations(meetingParticipants, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingParticipants.meetingId],
    references: [meetings.id],
  }),
  employee: one(employees, {
    fields: [meetingParticipants.employeeId],
    references: [employees.id],
    relationName: 'employeeParticipations',
  }),
  candidate: one(candidates, {
    fields: [meetingParticipants.candidateId],
    references: [candidates.id],
    relationName: 'candidateParticipations',
  }),
  client: one(clients, {
    fields: [meetingParticipants.clientId],
    references: [clients.id],
  }),
}));

// Clients relations
export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  meetingParticipations: many(meetingParticipants),
}));

// Projects relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  projectManager: one(employees, {
    fields: [projects.projectManagerId],
    references: [employees.id],
    relationName: 'projectManager',
  }),
  technologies: many(projectTechnologies),
  teamMembers: many(projectTeamMembers),
  meetings: many(meetings),
}));

// Technologies relations
export const technologiesRelations = relations(technologies, ({ many }) => ({
  projects: many(projectTechnologies),
}));

// Project Technologies relations
export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
  project: one(projects, {
    fields: [projectTechnologies.projectId],
    references: [projects.id],
  }),
  technology: one(technologies, {
    fields: [projectTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

// Project Team Members relations
export const projectTeamMembersRelations = relations(projectTeamMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectTeamMembers.projectId],
    references: [projects.id],
  }),
  employee: one(employees, {
    fields: [projectTeamMembers.employeeId],
    references: [employees.id],
  }),
}));

// Skills relations
export const skillsRelations = relations(skills, ({ many }) => ({
  employeeSkills: many(employeeSkills),
  candidateSkills: many(candidateSkills),
}));

// Employee Skills relations
export const employeeSkillsRelations = relations(employeeSkills, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeSkills.employeeId],
    references: [employees.id],
  }),
  skill: one(skills, {
    fields: [employeeSkills.skillId],
    references: [skills.id],
  }),
}));

// Candidate Skills relations
export const candidateSkillsRelations = relations(candidateSkills, ({ one }) => ({
  candidate: one(candidates, {
    fields: [candidateSkills.candidateId],
    references: [candidates.id],
  }),
  skill: one(skills, {
    fields: [candidateSkills.skillId],
    references: [skills.id],
  }),
}));

// Education relations
export const educationRelations = relations(education, ({ one }) => ({
  candidate: one(candidates, {
    fields: [education.candidateId],
    references: [candidates.id],
  }),
  employee: one(employees, {
    fields: [education.employeeId],
    references: [employees.id],
  }),
}));

// Work Experience relations
export const workExperienceRelations = relations(workExperience, ({ one }) => ({
  candidate: one(candidates, {
    fields: [workExperience.candidateId],
    references: [candidates.id],
  }),
  employee: one(employees, {
    fields: [workExperience.employeeId],
    references: [employees.id],
  }),
}));

// Positions relations
export const positionsRelations = relations(positions, ({ one, many }) => ({
  department: one(departments, {
    fields: [positions.departmentId],
    references: [departments.id],
  }),
  meetings: many(meetings),
}));