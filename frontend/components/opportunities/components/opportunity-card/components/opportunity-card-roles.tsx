import { CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { RoleCard } from "../../role-card/role-card";
import { OpportunityCardRolesProps } from "../types";
import { useOpportunityFilters } from "../../../hooks/useOpportunityFilters";
import { Role } from "@/lib/api-client";

// Filter roles based on current filters
const filterRoles = (roles: Role[], filters: any): Role[] => {
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

export const OpportunityCardRoles = ({
	opportunity,
	showActions,
	onUpdateRole,
}: OpportunityCardRolesProps) => {
	const { filters } = useOpportunityFilters();

	// Filter roles based on current filters
	const filteredRoles = filterRoles(opportunity.roles, filters);
	const hasActiveRoleFilters =
		filters.grades.length > 0 || filters.needsHire !== "all";

	return (
		<CardContent>
			<div className='border-t pt-4'>
				{opportunity.comment && (
					<div className='text-xs text-muted-foreground mb-3'>
						<span className='font-medium'>Comment:</span> {opportunity.comment}
					</div>
				)}
				<h4 className='font-semibold mb-3 flex items-center gap-2'>
					<Users className='h-4 w-4' />
					Roles for {opportunity.opportunityName}
					{hasActiveRoleFilters && (
						<span className='text-xs text-muted-foreground ml-2'>
							(Showing {filteredRoles.length} of {opportunity.roles.length}{" "}
							roles)
						</span>
					)}
				</h4>
				{opportunity.roles.length === 0 ? (
					<p className='text-gray-500 italic'>No roles added yet</p>
				) : (
					<div className='space-y-3'>
						{filteredRoles.map((role) => (
							<RoleCard
								key={role.id}
								role={role}
								showActions={showActions}
								opportunity={opportunity}
								onUpdateStatus={(roleId, status) =>
									onUpdateRole?.(opportunity.id, roleId, status)
								}
							/>
						))}
					</div>
				)}
			</div>
		</CardContent>
	);
};
