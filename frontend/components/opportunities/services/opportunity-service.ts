import { Opportunity, Role } from '@/lib/api-client';
import { CreateOpportunityForm, CreateRoleForm, OpportunityStatus, RoleStatus } from '@/lib/types';

export class OpportunityService {
  static checkOpportunityCompletion(opportunity: Opportunity): boolean {
    if (opportunity.roles.length === 0) return false;
    return opportunity.roles.every((role: Role) =>
      role.status === 'Won' || role.status === 'Lost' || role.status === 'Staffed'
    );
  }

  static createOpportunity(form: CreateOpportunityForm): Opportunity {
    return {
      id: String(Date.now()),
      ...form,
      createdAt: new Date().toISOString().split('T')[0],
      opportunityName: '',
      status: 'In Progress',
      isActive: false,
      updatedAt: '',
      isHighProbability: false,
      duration: null,
      isExpiringSoon: false,
      roles: []
    };
  }

  static createRole(form: CreateRoleForm): Omit<Role, 'id'> {
    const now = new Date().toISOString();
    return {
      opportunityId: form.opportunityId,
      roleName: form.roleName,
      jobGrade: form.jobGrade || undefined,
      level: form.level || undefined,
      allocation: form.allocation || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      notes: form.notes,
      assignedMembers: [],
      createdAt: now,
      updatedAt: now
    };
  }

  static updateRoleStatus(role: Role, newStatus: RoleStatus): Role {
    return {
      ...role,
      status: newStatus
    };
  }

  static changeOpportunityStatus(opportunity: Opportunity, newStatus: OpportunityStatus): Opportunity {
    return {
      ...opportunity,
      status: newStatus
    };
  }

  static addRoleToOpportunity(opportunity: Opportunity, role: Role): Opportunity {
    return {
      ...opportunity,
      roles: [...opportunity.roles, role]
    };
  }

  static updateRoleInOpportunity(opportunity: Opportunity, roleId: string, updatedRole: Role): Opportunity {
    return {
      ...opportunity,
      roles: opportunity.roles.map((role: Role) =>
        role.id === roleId ? updatedRole : role
      )
    };
  }

  static hasHiringNeeds(opportunity: Opportunity): boolean {
    return opportunity.roles.some(role => role.status === 'Open');
  }

  static getRolesByGrade(opportunity: Opportunity, grade: string): Role[] {
    if (grade === 'all') return opportunity.roles;
    return opportunity.roles.filter((role: Role) => role.jobGrade === grade);
  }

  static filterByHiringNeeds(opportunity: Opportunity, needsHire: string): boolean {
    if (needsHire === 'all') return true;
    const hasNeeds = this.hasHiringNeeds(opportunity);
    return needsHire === 'yes' ? hasNeeds : !hasNeeds;
  }

  static filterByClient(opportunity: Opportunity, clientFilter: string): boolean {
    if (!clientFilter) return true;
    return opportunity.clientName?.toLowerCase().includes(clientFilter.toLowerCase()) ?? false;
  }

  static roleNeedsHiring(role: Role): boolean {
    return role.status === 'Open';
  }

  static getRolesThatNeedHiring(opportunity: Opportunity): Role[] {
    return opportunity.roles.filter(role => this.roleNeedsHiring(role));
  }
} 
