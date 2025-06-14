import { Opportunity, Role } from "@/app/shared/types";

export type EditRoleModalProps = {
	isOpen: boolean;
	onClose: () => void;
	opportunityId: string;
	role: Role;
}

export type EditOpportunityModalProps = {
	isOpen: boolean;
	onClose: () => void;
	opportunity: Opportunity;
	listType: "in-progress" | "on-hold" | "completed";
}

export type UseEditOpportunityModalProps = {
	isOpen: boolean,
	opportunity: Opportunity,
	listType: "in-progress" | "on-hold" | "completed",
	onClose: () => void
}

export type UseEditRoleModalProps = {
	opportunityId: string,
	role: Role,
	onClose: () => void
}