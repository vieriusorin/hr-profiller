import { relations } from 'drizzle-orm';
import { clients } from './clients.schema';
import { opportunities } from './opportunities.schema';
import { opportunityRoles } from './opportunity-roles.schema';
import { opportunityRoleAssignments } from './opportunity-role-assignments.schema';
import { people } from './people.schema';
import { personStatus } from './person-status.schema';
import { employmentDetails } from './employment-details.schema';
import { personUnavailableDates } from './person-unavailable-dates.schema';
import { education } from './education.schema';
import { skills } from './skills.schema';
import { personSkills } from './person-skills.schema';
import { technologies } from './technologies.schema';
import { personTechnologies } from './person-technologies.schema';

export const clientsRelations = relations(clients, ({ many }) => ({
  opportunities: many(opportunities),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  client: one(clients, {
    fields: [opportunities.clientId],
    references: [clients.id],
  }),
  roles: many(opportunityRoles),
}));

export const opportunityRolesRelations = relations(opportunityRoles, ({ one, many }) => ({
  opportunity: one(opportunities, {
    fields: [opportunityRoles.opportunityId],
    references: [opportunities.id],
  }),
  assignments: many(opportunityRoleAssignments),
}));

export const opportunityRoleAssignmentsRelations = relations(opportunityRoleAssignments, ({ one }) => ({
  opportunityRole: one(opportunityRoles, {
    fields: [opportunityRoleAssignments.opportunityRoleId],
    references: [opportunityRoles.id],
  }),
  person: one(people, {
    fields: [opportunityRoleAssignments.personId],
    references: [people.id],
  }),
}));

export const peopleRelations = relations(people, ({ one, many }) => ({
  status: one(personStatus, {
    fields: [people.id],
    references: [personStatus.personId],
  }),
  employmentDetails: one(employmentDetails, {
    fields: [people.id],
    references: [employmentDetails.personId],
  }),
  unavailableDates: many(personUnavailableDates),
  education: many(education),
  personSkills: many(personSkills),
  personTechnologies: many(personTechnologies),
  opportunityRoleAssignments: many(opportunityRoleAssignments),
  // Manager relationship (self-referencing through employment details)
  managedEmployees: many(employmentDetails, {
    relationName: 'managerRelation',
  }),
}));

export const personStatusRelations = relations(personStatus, ({ one }) => ({
  person: one(people, {
    fields: [personStatus.personId],
    references: [people.id],
  }),
}));


export const employmentDetailsRelations = relations(employmentDetails, ({ one }) => ({
  person: one(people, {
    fields: [employmentDetails.personId],
    references: [people.id],
  }),
  manager: one(people, {
    fields: [employmentDetails.managerId],
    references: [people.id],
    relationName: 'managerRelation',
  }),
}));

export const personUnavailableDatesRelations = relations(personUnavailableDates, ({ one }) => ({
  person: one(people, {
    fields: [personUnavailableDates.personId],
    references: [people.id],
  }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  person: one(people, {
    fields: [education.personId],
    references: [people.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  personSkills: many(personSkills),
}));

export const personSkillsRelations = relations(personSkills, ({ one }) => ({
  person: one(people, {
    fields: [personSkills.personId],
    references: [people.id],
  }),
  skill: one(skills, {
    fields: [personSkills.skillId],
    references: [skills.id],
  }),
}));

export const technologiesRelations = relations(technologies, ({ many }) => ({
  personTechnologies: many(personTechnologies),
}));

export const personTechnologiesRelations = relations(personTechnologies, ({ one }) => ({
  person: one(people, {
    fields: [personTechnologies.personId],
    references: [people.id],
  }),
  technology: one(technologies, {
    fields: [personTechnologies.technologyId],
    references: [technologies.id],
  }),
}));