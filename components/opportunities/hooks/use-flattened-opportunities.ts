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
      if (opportunity.roles.length === 0) {
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
          rolesCount: 0,
          hasHiringNeeds: false,
          comment: opportunity.comment,
        });
      } else {
        opportunity.roles.forEach((role, roleIndex) => {
          const isFirstRow = roleIndex === 0;
          flattened.push({
            isOpportunityRow: isFirstRow,
            isFirstRowForOpportunity: isFirstRow,
            rowSpan: opportunity.roles.length,
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
            comment: isFirstRow ? opportunity.comment : undefined,
          });
        });
      }
    });
    return flattened;
  }, [opportunities]);
}; 