import { Opportunity, Role } from "@/lib/api-client";
import { FormActions } from "../forms/types";

type ListType = 'in-progress' | 'on-hold' | 'completed';

export type EditRoleModalProps = {
	isOpen: boolean;
	onClose: () => void;
	opportunityId: string;
	role: Role;
	opportunity: Opportunity;
};

export interface RoleFormProps extends FormActions {
	mode?: 'create' | 'edit';
}

export type EditOpportunityModalProps = {
	isOpen: boolean;
	onClose: () => void;
	opportunity: Opportunity;
	listType: ListType;
};

export type UseEditRoleModalProps = {
	opportunityId: string;
	role: Role;
	onClose: () => void;
}

export type UseEditOpportunityModalProps = {
	isOpen: boolean;
	opportunity: Opportunity;
	// listType: ListType;
	onClose: () => void;
}