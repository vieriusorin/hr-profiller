"use client";

import { Card } from "@/components/ui/card";
import { OpportunityCardHeader } from "./components/opportunity-card-header";
import { OpportunityCardDescription } from "./components/opportunity-card-description";
import { OpportunityCardActions } from "./components/opportunity-card-actions";
import { OpportunityCardRoles } from "./components/opportunity-card-roles";
import { useState, useEffect } from "react";
import { OpportunityCardProps } from "./types";
import {
	getStartDateUrgency,
	getUrgencyConfig,
} from "@/shared/lib/helpers/date-urgency";
import { EditOpportunityModal } from "../modals/edit-role-modal";

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
	const [currentOpportunity, setCurrentOpportunity] = useState(opportunity);

	useEffect(() => {
		setCurrentOpportunity(opportunity);
	}, [opportunity]);

	const urgency = getStartDateUrgency(
		currentOpportunity.expectedStartDate || ""
	);
	const urgencyConfig = getUrgencyConfig(urgency);
	return (
		<Card className={`mb-4 ${urgencyConfig.bgClass}`}>
			<OpportunityCardHeader
				opportunityName={currentOpportunity.opportunityName}
				status={
					currentOpportunity.status === "Done"
						? "Completed"
						: currentOpportunity.status
				}
				expectedStartDate={currentOpportunity.expectedStartDate || ""}
				isExpanded={isExpanded}
				onToggleExpanded={() => setIsExpanded(!isExpanded)}
				onEditClick={() => setIsEditModalOpen(true)}
				actions={
					showActions && (
						<OpportunityCardActions
							status={
								currentOpportunity.status === "Done"
									? "Completed"
									: currentOpportunity.status
							}
							onAddRole={() => onAddRole?.(currentOpportunity.id)}
							onMoveToHold={() => onMoveToHold?.(currentOpportunity.id)}
							onMoveToCompleted={() =>
								onMoveToCompleted?.(currentOpportunity.id)
							}
							onMoveToInProgress={() =>
								onMoveToInProgress?.(currentOpportunity.id)
							}
						/>
					)
				}
			/>
			<OpportunityCardDescription
				clientName={currentOpportunity.clientName || ""}
				expectedStartDate={currentOpportunity.expectedStartDate || ""}
				probability={currentOpportunity.probability || 0}
				createdAt={currentOpportunity.createdAt}
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
						currentOpportunity.status === "In Progress"
							? "in-progress"
							: currentOpportunity.status === "On Hold"
							? "on-hold"
							: "completed"
					}
				/>
			)}
		</Card>
	);
};
