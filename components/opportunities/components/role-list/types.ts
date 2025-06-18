import { Role, Opportunity } from "@/shared/types";

export type RoleListProps = {
    roles: Role[];
    opportunityId: string;
    opportunity: Opportunity;
}