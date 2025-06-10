export const queryKeys = {
  opportunities: {
    all: ['opportunities'] as const,
    lists: () => [...queryKeys.opportunities.all, 'list'] as const,
    list: (status: 'in-progress' | 'on-hold' | 'completed') => 
      [...queryKeys.opportunities.lists(), status] as const,
    detail: (id: number) => [...queryKeys.opportunities.all, 'detail', id] as const,
    inProgress: () => [...queryKeys.opportunities.list('in-progress')] as const,
    onHold: () => [...queryKeys.opportunities.list('on-hold')] as const,
    completed: () => [...queryKeys.opportunities.list('completed')] as const,
  },

  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.roles.all, 'detail', id] as const,
    byOpportunity: (opportunityId: number) => 
      [...queryKeys.roles.all, 'opportunity', opportunityId] as const,
  },

  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.members.all, 'detail', id] as const,
    available: () => [...queryKeys.members.lists(), 'available'] as const,
  },
} as const;


export const opportunityInvalidationPatterns = {
  all: () => queryKeys.opportunities.all,
  byStatus: (status: 'in-progress' | 'on-hold' | 'completed') => 
    queryKeys.opportunities.list(status),
  allLists: () => queryKeys.opportunities.lists(),
  byId: (id: number) => queryKeys.opportunities.detail(id),
};

export type OpportunityQueryKey = ReturnType<typeof queryKeys.opportunities[keyof typeof queryKeys.opportunities]>;
export type RoleQueryKey = ReturnType<typeof queryKeys.roles[keyof typeof queryKeys.roles]>;
export type MemberQueryKey = ReturnType<typeof queryKeys.members[keyof typeof queryKeys.members]>; 