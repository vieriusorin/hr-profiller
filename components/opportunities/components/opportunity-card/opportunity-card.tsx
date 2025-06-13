"use client";

import { Card } from '@/components/ui/card';
import { OpportunityCardHeader } from './components/opportunity-card-header';
import { OpportunityCardDescription } from './components/opportunity-card-description';
import { OpportunityCardActions } from './components/opportunity-card-actions';
import { OpportunityCardRoles } from './components/opportunity-card-roles';
import { useState, useEffect } from 'react';
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
	const [isTogglingActive, setIsTogglingActive] = useState(false);
	const [currentOpportunity, setCurrentOpportunity] = useState(opportunity);

	// Sync with prop changes
	useEffect(() => {
		setCurrentOpportunity(opportunity);
	}, [opportunity]);

	const urgency = getStartDateUrgency(currentOpportunity.expectedStartDate);
	const urgencyConfig = getUrgencyConfig(urgency);

	const handleToggleActiveStatus = async () => {
		if (isTogglingActive) return;

		setIsTogglingActive(true);
		try {
			const response = await fetch(`/api/opportunities/${currentOpportunity.id}/activate`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					isActive: !currentOpportunity.isActive,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to toggle active status');
			}

			const updatedOpportunity = await response.json();
			setCurrentOpportunity(updatedOpportunity);
		} catch (error) {
			console.error('Error toggling active status:', error);
			alert('Failed to toggle active status. Please try again.');
		} finally {
			setIsTogglingActive(false);
		}
	};

	return (
		<Card className={`mb-4 ${urgencyConfig.bgClass}`}>
			<OpportunityCardHeader
				opportunityName={currentOpportunity.opportunityName}
				status={currentOpportunity.status === 'Done' ? 'Completed' : currentOpportunity.status}
				expectedStartDate={currentOpportunity.expectedStartDate}
				isExpanded={isExpanded}
				onToggleExpanded={() => setIsExpanded(!isExpanded)}
				onEditClick={() => setIsEditModalOpen(true)}
				actions={showActions && (
					<OpportunityCardActions
						status={currentOpportunity.status === 'Done' ? 'Completed' : currentOpportunity.status}
						onAddRole={() => onAddRole?.(currentOpportunity.id)}
						onMoveToHold={() => onMoveToHold?.(currentOpportunity.id)}
						onMoveToCompleted={() => onMoveToCompleted?.(currentOpportunity.id)}
						onMoveToInProgress={() => onMoveToInProgress?.(currentOpportunity.id)}
					/>
				)}
			/>
			<OpportunityCardDescription
				clientName={currentOpportunity.clientName}
				expectedStartDate={currentOpportunity.expectedStartDate}
				probability={currentOpportunity.probability}
				createdAt={currentOpportunity.createdAt}
				isActive={currentOpportunity.isActive}
				activatedAt={currentOpportunity.activatedAt}
				onToggleActive={handleToggleActiveStatus}
				isTogglingActive={isTogglingActive}
			/>
			{isExpanded && (
				<OpportunityCardRoles
					opportunity={currentOpportunity}
					showActions={showActions}
					onUpdateRole={onUpdateRole}
				/>
			)}
			{isEditModalOpen && (
				<EditOpportunityModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					opportunity={currentOpportunity}
					listType={
						currentOpportunity.status === 'In Progress'
							? 'in-progress'
						: currentOpportunity.status === 'On Hold'
						? 'on-hold'
						: 'completed'
					}
				/>
			)}
		</Card>
	);
};
