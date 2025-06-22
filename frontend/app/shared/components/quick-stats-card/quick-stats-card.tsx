import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, UserPlus, Check } from "lucide-react";
import { Role } from "@/lib/types";
import { QuickStatsCardProps, StatCardProps } from "./types";

const getVariantClasses = (variant: string) => {
	switch (variant) {
		case "success":
			return "bg-primary/10 border-primary/20 text-primary";
		case "warning":
			return "bg-amber-500/10 border-amber-500/20 text-amber-500";
		case "info":
			return "bg-blue-500/10 border-blue-500/20 text-blue-500";
		default:
			return "bg-secondary/50 border-border text-secondary-foreground";
	}
};

const StatCard = ({
	title,
	value,
	icon,
	description,
	variant = "default",
}: StatCardProps) => {
	return (
		<div className={`rounded-lg border p-4 ${getVariantClasses(variant)}`}>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-sm font-medium opacity-70'>{title}</p>
					<p className='text-2xl font-bold'>{value.toLocaleString()}</p>
					{description && (
						<p className='text-xs opacity-60 mt-1'>{description}</p>
					)}
				</div>
				<div className='opacity-60'>{icon}</div>
			</div>
		</div>
	);
};

export const QuickStatsCard = ({
	opportunities,
	onHoldOpportunities,
	completedOpportunities,
}: QuickStatsCardProps) => {
	const allOpportunities = [
		...opportunities,
		...onHoldOpportunities,
		...completedOpportunities,
	];
	const activeOpportunitiesList = [...opportunities, ...onHoldOpportunities];
	const totalOpportunities = allOpportunities.length;

	const totalRoles = activeOpportunitiesList.reduce(
		(sum, opp) => sum + opp.roles.length,
		0
	);

	const hiringNeededCount = activeOpportunitiesList.reduce((sum, opp) => {
		return (
			sum +
			opp.roles.filter(
				(role: Role) =>
					role.status === "Open" &&
					(!role.assignedMembers || role.assignedMembers.length === 0)
			).length
		);
	}, 0);

	const activeOpportunities = opportunities.length;
	const completionRate =
		totalOpportunities > 0
			? Math.round((completedOpportunities.length / totalOpportunities) * 100)
			: 0;

	return (
		<Card>
			<CardContent className='pt-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					<StatCard
						title='Total Opportunities'
						value={totalOpportunities}
						icon={<Building2 className='h-8 w-8' />}
						description={`${activeOpportunities} active`}
						variant='info'
					/>

					<StatCard
						title='Total Roles'
						value={totalRoles}
						icon={<Users className='h-8 w-8' />}
						description={
							totalOpportunities > 0
								? `${Math.round(
										totalRoles / totalOpportunities
								  )} avg per opportunity`
								: ""
						}
						variant='default'
					/>

					<StatCard
						title='Hiring Needed'
						value={hiringNeededCount}
						icon={<UserPlus className='h-8 w-8' />}
						description={
							totalRoles > 0
								? `${Math.round(
										(hiringNeededCount / totalRoles) * 100
								  )}% of roles`
								: ""
						}
						variant={hiringNeededCount > 0 ? "warning" : "success"}
					/>

					<StatCard
						title='Completion Rate'
						value={completionRate}
						icon={<Check className='h-8 w-8' />}
						description={`${completedOpportunities.length} completed`}
						variant={
							completionRate >= 70
								? "success"
								: completionRate >= 40
								? "warning"
								: "default"
						}
					/>
				</div>
			</CardContent>
		</Card>
	);
};
