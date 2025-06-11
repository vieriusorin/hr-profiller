import { Opportunity, Role, OpportunityStatus, RoleStatus, CreateOpportunityForm, CreateRoleForm } from '../../../../shared/types';

export class OpportunityService {
  static checkOpportunityCompletion(opportunity: Opportunity): boolean {
    if (opportunity.roles.length === 0) return false;
    return opportunity.roles.every(role => 
      role.status === 'Won' || role.status === 'Lost' || role.status === 'Staffed'
    );
  }

  static createOpportunity(form: CreateOpportunityForm): Opportunity {
    return {
      id: Date.now(),
      ...form,
      openDate: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      roles: []
    };
  }

  static createRole(form: CreateRoleForm): Omit<Role, 'id'> {
    return {
      ...form,
      status: 'Open',
      assignedMember: null,
      needsHire: true
    };
  }

  static updateRoleStatus(role: Role, newStatus: RoleStatus): Role {
    return {
      ...role,
      status: newStatus,
      needsHire: newStatus !== 'Staffed' && newStatus !== 'Won'
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
      roles: opportunity.roles.map(role => 
        role.id === roleId ? updatedRole : role
      )
    };
  }

  static hasHiringNeeds(opportunity: Opportunity): boolean {
    return opportunity.roles.some(role => role.needsHire);
  }

  static getRolesByGrade(opportunity: Opportunity, grade: string): Role[] {
    if (grade === 'all') return opportunity.roles;
    return opportunity.roles.filter(role => role.requiredGrade === grade);
  }

  static filterByHiringNeeds(opportunity: Opportunity, needsHire: string): boolean {
    if (needsHire === 'all') return true;
    const hasNeeds = this.hasHiringNeeds(opportunity);
    return needsHire === 'yes' ? hasNeeds : !hasNeeds;
  }

  static filterByClient(opportunity: Opportunity, clientFilter: string): boolean {
    if (!clientFilter) return true;
    return opportunity.clientName.toLowerCase().includes(clientFilter.toLowerCase());
  }
} 