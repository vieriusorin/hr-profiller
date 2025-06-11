import { OpportunityFilters } from '@/shared/types';

export const queryKeys = {
  opportunities: {
    all: ['opportunities'] as const,
    lists: () => [...queryKeys.opportunities.all, 'list'] as const,
    list: (status: 'in-progress' | 'on-hold' | 'completed', filters?: OpportunityFilters) => 
      [...queryKeys.opportunities.lists(), status, filters ? { ...filters } : {}] as const,
    detail: (id: string) => [...queryKeys.opportunities.all, 'detail', id] as const,
    inProgress: (filters?: OpportunityFilters) => [...queryKeys.opportunities.list('in-progress', filters)] as const,
    onHold: (filters?: OpportunityFilters) => [...queryKeys.opportunities.list('on-hold', filters)] as const,
    completed: (filters?: OpportunityFilters) => [...queryKeys.opportunities.list('completed', filters)] as const,
  },

  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.roles.all, 'detail', id] as const,
    byOpportunity: (opportunityId: string) => 
      [...queryKeys.roles.all, 'opportunity', opportunityId] as const,
  },

  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.members.all, 'detail', id] as const,
    available: () => [...queryKeys.members.lists(), 'available'] as const,
  },
} as const;


export const opportunityInvalidationPatterns = {
  all: () => queryKeys.opportunities.all,
  byStatus: (status: 'in-progress' | 'on-hold' | 'completed') => 
    queryKeys.opportunities.list(status),
  allLists: () => queryKeys.opportunities.lists(),
  byId: (id: string) => queryKeys.opportunities.detail(id),
};

export type OpportunityQueryKey = ReturnType<typeof queryKeys.opportunities[keyof Omit<typeof queryKeys.opportunities, 'all'>]>;
export type RoleQueryKey = ReturnType<typeof queryKeys.roles[keyof Omit<typeof queryKeys.roles, 'all'>]>;
export type MemberQueryKey = ReturnType<typeof queryKeys.members[keyof Omit<typeof queryKeys.members, 'all'>]>; 
