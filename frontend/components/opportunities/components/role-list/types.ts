import { Role, Opportunity } from '@/lib/api-client';

export type RoleListProps = {
    roles: Role[];
    opportunityId: string;
    opportunity: Opportunity;
}