"use client";

import { Card } from '@/components/ui/card';
import { OpportunityCardHeader } from './components/opportunity-card-header';
import { OpportunityCardDescription } from './components/opportunity-card-description';
import { OpportunityCardActions } from './components/opportunity-card-actions';
import { OpportunityCardRoles } from './components/opportunity-card-roles';
import { useState } from 'react';
import { OpportunityCardProps } from './types';
import { getStartDateUrgency, getUrgencyConfig } from '@/shared/lib/helpers/date-urgency';
import { EditOpportunityModal } from '../modals/edit-role-modal';

export const OpportunityCard = ({
	opportunity,
	showActions,
	onUpdateRole,
	onAddRole,
	onMoveToHold,
	onMoveToCompleted,
	onMoveToInProgress,
}: OpportunityCardProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const urgency = getStartDateUrgency(opportunity.expectedStartDate);
	const urgencyConfig = getUrgencyConfig(urgency);

	return (
		<Card className={`mb-4 ${urgencyConfig.bgClass}`}>
			<OpportunityCardHeader
				opportunityName={opportunity.opportunityName}
				status={opportunity.status === 'Done' ? 'Completed' : opportunity.status}
				expectedStartDate={opportunity.expectedStartDate}
				isExpanded={isExpanded}
				onToggleExpanded={() => setIsExpanded(!isExpanded)}
				onEditClick={() => setIsEditModalOpen(true)}
				actions={showActions && (
					<OpportunityCardActions
						status={opportunity.status === 'Done' ? 'Completed' : opportunity.status}
						onAddRole={() => onAddRole?.(opportunity.id)}
						onMoveToHold={() => onMoveToHold?.(opportunity.id)}
						onMoveToCompleted={() => onMoveToCompleted?.(opportunity.id)}
						onMoveToInProgress={() => onMoveToInProgress?.(opportunity.id)}
					/>
				)}
			/>
			<OpportunityCardDescription
				clientName={opportunity.clientName}
				expectedStartDate={opportunity.expectedStartDate}
				probability={opportunity.probability}
			/>
			{isExpanded && (
				<OpportunityCardRoles
					opportunity={opportunity}
					showActions={showActions}
					onUpdateRole={onUpdateRole}
				/>
			)}
			{isEditModalOpen && (
				<EditOpportunityModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					opportunity={opportunity}
					listType={
						opportunity.status === 'In Progress'
							? 'in-progress'
						: opportunity.status === 'On Hold'
						? 'on-hold'
						: 'completed'
					}
				/>
			)}
		</Card>
	);
};
