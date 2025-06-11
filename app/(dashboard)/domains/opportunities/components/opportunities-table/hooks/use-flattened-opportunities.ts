import { useMemo } from 'react';
import type { Opportunity } from '@/shared/types';
import type { FlattenedRow } from '../types';

export const useFlattenedOpportunities = (opportunities: Opportunity[]): FlattenedRow[] => {
  return useMemo(() => {
    const flattened: FlattenedRow[] = [];

    opportunities.forEach(opportunity => {
      // Always add the opportunity row first (without role data)
      flattened.push({
        opportunityId: opportunity.id,
        opportunityName: opportunity.opportunityName,
        clientName: opportunity.clientName,
        expectedStartDate: opportunity.expectedStartDate,
        probability: opportunity.probability,
        opportunityStatus: opportunity.status,
        rolesCount: opportunity.roles.length,
        hasHiringNeeds: opportunity.roles.some(r => r.needsHire),
        isFirstRowForOpportunity: true,
        isOpportunityRow: true,
        rowSpan: opportunity.roles.length + 1, // +1 for the opportunity row itself
      });

      // Then add role rows (if any)
      opportunity.roles.forEach((role) => {
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
          isFirstRowForOpportunity: false,
          isOpportunityRow: false,
          isRoleRow: true,
          rowSpan: 1,
        });
      });
    });

    return flattened;
  }, [opportunities]);
}; 
