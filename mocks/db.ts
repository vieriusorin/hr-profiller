import { Opportunity, Role } from '@/shared/types';

let mockOpportunities: Opportunity[] = [
    {
      id: 1,
      clientName: 'TechCorp Solutions',
      opportunityName: 'E-commerce Platform Redesign',
      openDate: '2024-05-15',
      expectedStartDate: '2024-07-01',
      probability: 85,
      status: 'In Progress',
      roles: [
        {
          id: 1,
          roleName: 'Senior Frontend Developer',
          requiredGrade: 'SC',
          status: 'Open',
          assignedMember: null,
          needsHire: true,
          comments: 'React expertise required'
        },
        {
          id: 2,
          roleName: 'Backend Developer',
          requiredGrade: 'SE',
          status: 'Staffed',
          assignedMember: {
            id: 1,
            fullName: 'John Smith',
            actualGrade: 'SE',
            allocation: 75,
            availableFrom: '2024-06-15'
          },
          needsHire: false,
          comments: ''
        }
      ]
    },
    {
      id: 2,
      clientName: 'Financial Services Inc',
      opportunityName: 'Mobile Banking App',
      openDate: '2024-05-20',
      expectedStartDate: '2024-08-15',
      probability: 60,
      status: 'In Progress',
      roles: [
        {
          id: 3,
          roleName: 'Mobile Developer',
          requiredGrade: 'SC',
          status: 'Open',
          assignedMember: null,
          needsHire: true,
          comments: 'iOS and Android experience needed'
        }
      ]
    },
    {
        id: 4,
        clientName: 'HealthWell Group',
        opportunityName: 'Patient Portal',
        openDate: '2024-06-01',
        expectedStartDate: '2024-08-01',
        probability: 75,
        status: 'In Progress',
        roles: []
    }
  ];
  
  let mockOnHoldOpportunities: Opportunity[] = [
    {
      id: 3,
      clientName: 'RetailChain Ltd',
      opportunityName: 'Inventory Management System',
      openDate: '2024-04-10',
      expectedStartDate: '2024-09-01',
      probability: 40,
      status: 'On Hold',
      roles: []
    }
  ];
  
  let mockCompletedOpportunities: Opportunity[] = [];

  const getNextId = () => {
    const allOpps = [...mockOpportunities, ...mockOnHoldOpportunities, ...mockCompletedOpportunities];
    return Math.max(...allOpps.map(o => o.id), 0) + 1;
  }

  const getNextRoleId = () => {
    const allRoles = [...mockOpportunities, ...mockOnHoldOpportunities, ...mockCompletedOpportunities].flatMap(o => o.roles);
    return Math.max(...allRoles.map(r => r.id), 0) + 1;
  }
  
  // Export the data and manipulation functions
  export const db = {
    opportunities: {
        getAllInProgress: () => mockOpportunities,
        getAllOnHold: () => mockOnHoldOpportunities,
        getAllCompleted: () => mockCompletedOpportunities,
        create: (data: Partial<Opportunity>) => {
            const newOpp: Opportunity = {
                id: getNextId(),
                clientName: data.clientName!,
                opportunityName: data.opportunityName!,
                openDate: new Date().toISOString().split('T')[0],
                expectedStartDate: data.expectedStartDate!,
                probability: data.probability!,
                status: 'In Progress',
                roles: [],
            };
            mockOpportunities.push(newOpp);
            return newOpp;
        },
        update: (id: number, data: Opportunity) => {
            const allOpps = [mockOpportunities, mockOnHoldOpportunities, mockCompletedOpportunities];
            for (const list of allOpps) {
                const index = list.findIndex(opp => opp.id === id);
                if (index !== -1) {
                    list[index] = data;
                    return data;
                }
            }
            return null;
        },
        move: (id: number, toStatus: 'In Progress' | 'On Hold' | 'Done') => {
            let opp: Opportunity | undefined;
            let fromList: Opportunity[] | undefined;

            if (mockOpportunities.some(o => o.id === id)) {
                fromList = mockOpportunities;
            } else if (mockOnHoldOpportunities.some(o => o.id === id)) {
                fromList = mockOnHoldOpportunities;
            } else if (mockCompletedOpportunities.some(o => o.id === id)) {
                fromList = mockCompletedOpportunities;
            }

            if (!fromList) return null;

            const oppIndex = fromList.findIndex(o => o.id === id);
            opp = fromList.splice(oppIndex, 1)[0];
            opp.status = toStatus;

            if (toStatus === 'In Progress') mockOpportunities.push(opp);
            else if (toStatus === 'On Hold') mockOnHoldOpportunities.push(opp);
            else mockCompletedOpportunities.push(opp);

            return opp;
        },
        addRole: (oppId: number, roleData: Partial<Role>) => {
            const allOpps = [mockOpportunities, mockOnHoldOpportunities, mockCompletedOpportunities];
            for (const list of allOpps) {
                const opp = list.find(o => o.id === oppId);
                if (opp) {
                    const newRole: Role = {
                        id: getNextRoleId(),
                        roleName: roleData.roleName!,
                        requiredGrade: roleData.requiredGrade!,
                        status: 'Open',
                        assignedMember: null,
                        needsHire: false,
                        comments: ''
                    };
                    opp.roles.push(newRole);
                    return opp;
                }
            }
            return null;
        },
        updateRoleStatus: (oppId: number, roleId: number, status: string) => {
            const allOpps = [mockOpportunities, mockOnHoldOpportunities, mockCompletedOpportunities];
            for (const list of allOpps) {
                const opp = list.find(o => o.id === oppId);
                if (opp) {
                    const role = opp.roles.find(r => r.id === roleId);
                    if (role) {
                        role.status = status as any;
                        return opp;
                    }
                }
            }
            return null;
        }
    }
  }
