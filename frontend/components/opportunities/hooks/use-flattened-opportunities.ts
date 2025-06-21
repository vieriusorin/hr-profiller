import { useMemo } from "react";
import { FlattenedRow } from "../components/opportunities-table/types";
import { useOpportunityFilters } from "./useOpportunityFilters";
import { Opportunity as ApiOpportunity, Role } from "@/lib/api-client";

// Extended Opportunity type that includes roles (dynamically attached by backend)
type OpportunityWithRoles = ApiOpportunity & {
  roles: Role[];
};

// Filter roles based on current filters
const filterRoles = (roles: Role[], filters: any): Role[] => {
  return roles.filter((role) => {
    // Filter by grades (use jobGrade from API, not requiredGrade)
    if (filters.grades && filters.grades.length > 0) {
      if (!role.jobGrade || !filters.grades.includes(role.jobGrade)) {
        return false;
      }
    }

    // Filter by needsHire (check if status is "Open" - meaning it needs hiring)
    if (filters.needsHire && filters.needsHire !== 'all') {
      const needsHire = filters.needsHire === 'yes';
      const roleNeedsHire = role.status === 'Open';
      if (needsHire !== roleNeedsHire) {
        return false;
      }
    }

    return true;
  });
};

export const useFlattenedOpportunities = (
  opportunities: OpportunityWithRoles[]
): FlattenedRow[] => {
  const { filters } = useOpportunityFilters();

  return useMemo(() => {
    if (!opportunities) return [];
    const flattened: FlattenedRow[] = [];

    console.log('useFlattenedOpportunities - opportunities:', opportunities);

    opportunities.forEach((opportunity) => {
      // Filter roles based on current filters
      const filteredRoles = filterRoles(opportunity.roles || [], filters);

      console.log(`Opportunity ${opportunity.opportunityName} - original roles:`, opportunity.roles);
      console.log(`Opportunity ${opportunity.opportunityName} - filtered roles:`, filteredRoles);

      // Always add the opportunity row first
      flattened.push({
        isOpportunityRow: true,
        isFirstRowForOpportunity: true,
        rowSpan: 1,
        opportunityId: opportunity.id,
        opportunityName: opportunity.opportunityName,
        opportunityStatus: opportunity.status,
        clientName: opportunity.clientName || 'Unknown Client', // Handle null
        expectedStartDate: opportunity.expectedStartDate || '', // Handle null
        probability: opportunity.probability || 0, // Handle null with default
        rolesCount: filteredRoles.length, // Use filtered count
        hasHiringNeeds: filteredRoles.some((r) => r.status === 'Open'), // Use filtered roles and check status
        comment: opportunity.comment || undefined, // Handle null
      });

      // Then add filtered role rows
      filteredRoles.forEach((role) => {
        console.log(`Adding role row for role:`, role);
        console.log(`Role ID: ${role.id}, Role Name: ${role.roleName}`);

        flattened.push({
          isOpportunityRow: false,
          isFirstRowForOpportunity: false,
          rowSpan: 1,
          opportunityId: opportunity.id,
          opportunityName: opportunity.opportunityName,
          opportunityStatus: opportunity.status,
          clientName: opportunity.clientName || 'Unknown Client', // Handle null
          expectedStartDate: opportunity.expectedStartDate || '', // Handle null
          probability: opportunity.probability || 0, // Handle null with default
          rolesCount: filteredRoles.length, // Use filtered count
          hasHiringNeeds: filteredRoles.some((r) => r.status === 'Open'), // Use filtered roles and check status
          roleId: role.id,
          roleName: role.roleName,
          requiredGrade: role.jobGrade || undefined, // Map jobGrade to requiredGrade for table display, handle null
          roleStatus: role.status,
          assignedMemberIds: [], // This property doesn't exist in the API, default to empty array
          allocation: role.allocation || undefined, // Handle null values
          needsHire: role.status === 'Open', // Derive needsHire from status
          newHireName: undefined, // This property doesn't exist in the API
        });
      });
    });

    console.log('useFlattenedOpportunities - final flattened data:', flattened);
    return flattened;
  }, [opportunities, filters]); // Add filters to dependency array
}; 