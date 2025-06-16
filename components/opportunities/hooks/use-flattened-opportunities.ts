import { useMemo } from "react";
import { Opportunity } from "@/app/shared/types";
import { FlattenedRow } from "../components/opportunities-table/types";

export const useFlattenedOpportunities = (
  opportunities: Opportunity[]
): FlattenedRow[] => {
  return useMemo(() => {
    if (!opportunities) return [];
    const flattened: FlattenedRow[] = [];

    opportunities.forEach((opportunity) => {
      // Always add the opportunity row first
      flattened.push({
        isOpportunityRow: true,
        isFirstRowForOpportunity: true,
        rowSpan: 1,
        opportunityId: opportunity.id,
        opportunityName: opportunity.opportunityName,
        opportunityStatus: opportunity.status,
        clientName: opportunity.clientName,
        expectedStartDate: opportunity.expectedStartDate,
        probability: opportunity.probability,
        rolesCount: opportunity.roles.length,
        hasHiringNeeds: opportunity.roles.some((r) => r.needsHire),
        comment: opportunity.comment,
      });

      // Then add all role rows
      opportunity.roles.forEach((role) => {
        flattened.push({
          isOpportunityRow: false,
          isFirstRowForOpportunity: false,
          rowSpan: 1,
          opportunityId: opportunity.id,
          opportunityName: opportunity.opportunityName,
          opportunityStatus: opportunity.status,
          clientName: opportunity.clientName,
          expectedStartDate: opportunity.expectedStartDate,
          probability: opportunity.probability,
          rolesCount: opportunity.roles.length,
          hasHiringNeeds: opportunity.roles.some((r) => r.needsHire),
          roleId: role.id,
          roleName: role.roleName,
          requiredGrade: role.requiredGrade,
          roleStatus: role.status,
          assignedMemberIds: role.assignedMemberIds,
          allocation: role.allocation,
          needsHire: role.needsHire,
          newHireName: role.newHireName,
        });
      });
    });

    return flattened;
  }, [opportunities]);
}; 