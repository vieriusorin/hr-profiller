import { CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { RoleCard } from "../../role-card/role-card";
import { OpportunityCardRolesProps } from "../types";

export const OpportunityCardRoles = ({
	opportunity,
	showActions,
	onUpdateRole,
}: OpportunityCardRolesProps) => {
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
				</h4>
				{opportunity.roles.length === 0 ? (
					<p className='text-gray-500 italic'>No roles added yet</p>
				) : (
					<div className='space-y-3'>
						{opportunity.roles.map((role) => (
							<RoleCard
								key={role.id}
								role={role}
								showActions={showActions}
								opportunityId={opportunity.id}
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
