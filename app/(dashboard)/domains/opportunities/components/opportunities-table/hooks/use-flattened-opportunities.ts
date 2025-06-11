import { useMemo } from 'react';
import type { Opportunity } from '@/shared/types';
import type { FlattenedRow } from '../types';

export const useFlattenedOpportunities = (opportunities: Opportunity[]): FlattenedRow[] => {
  return useMemo(() => {
    const flattened: FlattenedRow[] = [];

    opportunities.forEach(opportunity => {
      if (opportunity.roles.length === 0) {
        flattened.push({
          opportunityId: opportunity.id,
          opportunityName: opportunity.opportunityName,
          clientName: opportunity.clientName,
          expectedStartDate: opportunity.expectedStartDate,
          probability: opportunity.probability,
          opportunityStatus: opportunity.status,
          rolesCount: 0,
          hasHiringNeeds: false,
          isFirstRowForOpportunity: true,
          rowSpan: 1,
        });
      } else {
        opportunity.roles.forEach((role, index) => {
          flattened.push({
            opportunityId: opportunity.id,
            opportunityName: opportunity.opportunityName,
            clientName: opportunity.clientName,
            expectedStartDate: opportunity.expectedStartDate,
            probability: opportunity.probability,
            opportunityStatus: opportunity.status,
            rolesCount: opportunity.roles.length,
            hasHiringNeeds: opportunity.roles.some(r => r.needsHire),
            roleId: role.id,
            roleName: role.roleName,
            requiredGrade: role.requiredGrade,
            roleStatus: role.status,
            assignedMember: role.assignedMember?.fullName,
            needsHire: role.needsHire,
            allocation: role.assignedMember?.allocation,
            isFirstRowForOpportunity: index === 0,
            rowSpan: opportunity.roles.length,
          });
        });
      }
    });

    return flattened;
  }, [opportunities]);
}; 