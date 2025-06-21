import { Role } from "@/lib/api-client";
import { Opportunity } from "@/lib/types";

/**
 * Filter roles based on current filters
 * @param roles - Array of roles to filter
 * @param filters - Current filter state
 * @returns Filtered array of roles
 */
export const filterRoles = (roles: Role[], filters: any): Role[] => {
  if (!roles || roles.length === 0) return roles;

  return roles.filter((role) => {
    // Filter by grades (use jobGrade from API)
    if (filters.grades && filters.grades.length > 0) {
      if (!role.jobGrade || !filters.grades.includes(role.jobGrade)) {
        return false;
      }
    }

    // Filter by needsHire
    if (filters.needsHire && filters.needsHire !== "all") {
      const needsHire = filters.needsHire === "yes";
      const roleNeedsHire = role.status === "Open";
      if (needsHire !== roleNeedsHire) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Filter opportunities that have at least one matching role
 * @param opportunities - Array of opportunities to filter
 * @param filters - Current filter state
 * @returns Filtered array of opportunities
 */
export const filterOpportunitiesWithMatchingRoles = (
  opportunities: Opportunity[],
  filters: any
): Opportunity[] => {
  // If no role-specific filters are active, return all opportunities
  const hasRoleFilters =
    (filters.grades && filters.grades.length > 0) ||
    (filters.needsHire && filters.needsHire !== "all");

  if (!hasRoleFilters) {
    return opportunities;
  }

  return opportunities.filter((opportunity) => {
    // Handle dynamic roles property (attached by backend service but not in type)
    const opportunityWithRoles = opportunity as any;
    const matchingRoles = filterRoles(opportunityWithRoles.roles || [], filters);
    return matchingRoles.length > 0;
  });
}; 