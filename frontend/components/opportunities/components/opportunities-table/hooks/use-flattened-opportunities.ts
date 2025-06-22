import { useMemo } from 'react';
import type { Opportunity } from '@/lib/api-client';
import type { FlattenedRow } from '../types';

export const useFlattenedOpportunities = (opportunities: Opportunity[]): FlattenedRow[] => {
  return useMemo(() => {
    const flattened: FlattenedRow[] = [];

    opportunities.forEach(opportunity => {
      // Always add the opportunity row first (without role data)
      flattened.push({
        opportunityId: opportunity.id,
        opportunityName: opportunity.opportunityName,
        clientName: opportunity.clientName ?? '',
        expectedStartDate: opportunity.expectedStartDate ?? '',
        probability: opportunity.probability ?? 0,
        opportunityStatus: opportunity.status,
        rolesCount: opportunity.roles.length,
        hasHiringNeeds: opportunity.roles.some(r => r.assignedMembers.length === 0),
        comment: opportunity.comment ?? '',
        isFirstRowForOpportunity: true,
        isOpportunityRow: true,
        rowSpan: opportunity.roles.length + 1, // +1 for the opportunity row itself
      });

      // Then add role rows (if any)
      opportunity.roles.forEach((role, idx) => {
        flattened.push({
          opportunityId: opportunity.id,
          opportunityName: opportunity.opportunityName,
          clientName: opportunity.clientName ?? '',
          expectedStartDate: opportunity.expectedStartDate ?? '',
          probability: opportunity.probability ?? 0,
          opportunityStatus: opportunity.status,
          rolesCount: opportunity.roles.length,
          hasHiringNeeds: opportunity.roles.some(r => r.assignedMembers.length === 0),
          roleId: role.id,
          roleName: role.roleName,
          requiredGrade: role.jobGrade,
          roleStatus: role.status,
          assignedMemberIds: role.assignedMembers.map(member => member.id),
          newHireName: role.assignedMembers.find(member => member.fullName)?.fullName,
          needsHire: role.assignedMembers.length === 0,
          allocation: role.allocation,
          isFirstRowForOpportunity: idx === 0, // Only first role row is true
          isOpportunityRow: false,
          isRoleRow: true,
          rowSpan: 1,
        });
      });
    });

    return flattened;
  }, [opportunities]);
}; 
