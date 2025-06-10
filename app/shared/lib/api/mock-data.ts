import { Opportunity, OpportunityFilters } from '../../types';

// Helper function to filter opportunities
const applyFilters = (opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[] => {
  return opportunities.filter(opp => {
    const clientMatch = !filters.client || opp.clientName.toLowerCase().includes(filters.client.toLowerCase());
    
    const gradeMatch = !filters.grades || filters.grades.length === 0 || opp.roles.some(role => filters.grades.includes(role.requiredGrade));
    
    const hireMatch = filters.needsHire === 'all' || opp.roles.some(role => {
      if (filters.needsHire === 'yes') return role.needsHire;
      if (filters.needsHire === 'no') return !role.needsHire;
      return true;
    });

    const probabilityMatch = !filters.probability || (opp.probability >= filters.probability[0] && opp.probability <= filters.probability[1]);
    
    return clientMatch && gradeMatch && hireMatch && probabilityMatch;
  });
};

// Use let instead of const so we can modify these arrays
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

// Helper function to find opportunity across all arrays
const findOpportunityById = (opportunityId: number): { opportunity: Opportunity; array: Opportunity[] } | null => {
  const arrays = [mockOpportunities, mockOnHoldOpportunities, mockCompletedOpportunities];
  
  for (const array of arrays) {
    const opportunity = array.find(opp => opp.id === opportunityId);
    if (opportunity) {
      return { opportunity, array };
    }
  }
  
  return null;
};

// Helper function to generate next role ID
const getNextRoleId = (): number => {
  let maxId = 0;
  const allOpportunities = [...mockOpportunities, ...mockOnHoldOpportunities, ...mockCompletedOpportunities];
  
  allOpportunities.forEach(opp => {
    opp.roles.forEach(role => {
      if (role.id > maxId) maxId = role.id;
    });
  });
  
  return maxId + 1;
};

// Simulate API calls
export const opportunityApi = {
  async getInProgressOpportunities(filters?: OpportunityFilters): Promise<Opportunity[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const data = [...mockOpportunities];
    if (!filters) return data;
    return applyFilters(data, filters);
  },

  async getOnHoldOpportunities(filters?: OpportunityFilters): Promise<Opportunity[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const data = [...mockOnHoldOpportunities];
    if (!filters) return data;
    return applyFilters(data, filters);
  },

  async getCompletedOpportunities(filters?: OpportunityFilters): Promise<Opportunity[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const data = [...mockCompletedOpportunities];
    if (!filters) return data;
    return applyFilters(data, filters);
  },

  async createOpportunity(opportunity: Opportunity): Promise<Opportunity> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Generate a new ID
    const newId = Math.max(
      ...mockOpportunities.map(o => o.id),
      ...mockOnHoldOpportunities.map(o => o.id),
      ...mockCompletedOpportunities.map(o => o.id),
      0
    ) + 1;
    
    const newOpportunity = {
      ...opportunity,
      id: newId,
      status: 'In Progress' as const,
      openDate: new Date().toISOString().split('T')[0],
      roles: []
    };
    
    // Add to the appropriate array based on status
    mockOpportunities.push(newOpportunity);
    
    return newOpportunity;
  },

  async addRoleToOpportunity(opportunityId: number, roleData: any): Promise<Opportunity> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('🔧 Adding role to opportunity:', { opportunityId, roleData });
    
    const result = findOpportunityById(opportunityId);
    if (!result) {
      console.error('❌ Opportunity not found:', opportunityId);
      throw new Error('Opportunity not found');
    }
    
    const { opportunity, array } = result;
    console.log('✅ Found opportunity:', opportunity.opportunityName, 'in array with', array.length, 'items');
    
    // Create new role with generated ID
    const newRole = {
      ...roleData,
      id: getNextRoleId(),
      status: 'Open' as const,
      assignedMember: null,
    };
    
    console.log('🆕 Created new role:', newRole);
    
    // Update the opportunity with the new role
    const updatedOpportunity = {
      ...opportunity,
      roles: [...opportunity.roles, newRole]
    };
    
    console.log('📝 Updated opportunity roles count:', updatedOpportunity.roles.length);
    
    // Replace in the array
    const index = array.findIndex(opp => opp.id === opportunityId);
    if (index !== -1) {
      array[index] = updatedOpportunity;
      console.log('💾 Updated opportunity in array at index:', index);
    } else {
      console.error('❌ Could not find opportunity in array to update');
    }
    
    return updatedOpportunity;
  },

  async updateOpportunity(opportunity: Opportunity): Promise<Opportunity> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find and update in the appropriate array
    const arrays = [mockOpportunities, mockOnHoldOpportunities, mockCompletedOpportunities];
    
    for (const array of arrays) {
      const index = array.findIndex(o => o.id === opportunity.id);
      if (index !== -1) {
        array[index] = opportunity;
        break;
      }
    }
    
    return opportunity;
  },

  async moveOpportunity(opportunityId: number, toStatus: 'In Progress' | 'On Hold' | 'Done'): Promise<Opportunity> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find the opportunity in any array
    let opportunity: Opportunity | undefined;
    let sourceArray: Opportunity[] | undefined;
    
    const arrays = [
      { array: mockOpportunities, status: 'In Progress' },
      { array: mockOnHoldOpportunities, status: 'On Hold' },
      { array: mockCompletedOpportunities, status: 'Done' }
    ];
    
    for (const { array } of arrays) {
      const index = array.findIndex(o => o.id === opportunityId);
      if (index !== -1) {
        opportunity = array[index];
        sourceArray = array;
        array.splice(index, 1); // Remove from source
        break;
      }
    }
    
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }
    
    // Update status and add to target array
    const updatedOpportunity = { ...opportunity, status: toStatus };
    
    if (toStatus === 'In Progress') {
      mockOpportunities.push(updatedOpportunity);
    } else if (toStatus === 'On Hold') {
      mockOnHoldOpportunities.push(updatedOpportunity);
    } else if (toStatus === 'Done') {
      mockCompletedOpportunities.push(updatedOpportunity);
    }
    
    return updatedOpportunity;
  },

  async updateRoleStatus(opportunityId: number, roleId: number, status: string): Promise<Opportunity> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('🔧 Updating role status:', { opportunityId, roleId, status });
    
    const result = findOpportunityById(opportunityId);
    if (!result) {
      console.error('❌ Opportunity not found:', opportunityId);
      throw new Error('Opportunity not found');
    }
    
    const { opportunity, array } = result;
    console.log('✅ Found opportunity:', opportunity.opportunityName);
    
    // Update the role status
    const updatedRoles = opportunity.roles.map(role => {
      if (role.id === roleId) {
        return { ...role, status: status as any };
      }
      return role;
    });
    
    const updatedOpportunity = {
      ...opportunity,
      roles: updatedRoles
    };
    
    console.log('📝 Updated role status in opportunity');
    
    // Replace in the array
    const index = array.findIndex(opp => opp.id === opportunityId);
    if (index !== -1) {
      array[index] = updatedOpportunity;
      console.log('💾 Updated opportunity in array at index:', index);
    } else {
      console.error('❌ Could not find opportunity in array to update');
    }
    
    return updatedOpportunity;
  }
}; 