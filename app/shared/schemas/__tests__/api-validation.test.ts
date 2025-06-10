import { 
  OpportunitySchema,
  RoleSchema,
  MemberSchema,
  validateOpportunity,
  validateOpportunities,
  safeParseOpportunities,
  CreateOpportunityInputSchema,
  CreateRoleInputSchema,
  GradeSchema,
  OpportunityStatusSchema,
  RoleStatusSchema
} from '../api-schemas';

describe('API Validation Schemas', () => {
  
  describe('GradeSchema', () => {
    it('should validate all valid grade values', () => {
      const validGrades = ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'];
      
      validGrades.forEach(grade => {
        expect(() => GradeSchema.parse(grade)).not.toThrow();
      });
    });

    it('should reject invalid grade values', () => {
      const invalidGrades = ['INVALID', 'junior', '', null, undefined, 123];
      
      invalidGrades.forEach(grade => {
        expect(() => GradeSchema.parse(grade)).toThrow();
      });
    });
  });

  describe('OpportunityStatusSchema', () => {
    it('should validate valid opportunity statuses', () => {
      const validStatuses = ['In Progress', 'On Hold', 'Done'];
      
      validStatuses.forEach(status => {
        expect(() => OpportunityStatusSchema.parse(status)).not.toThrow();
      });
    });

    it('should reject invalid opportunity statuses', () => {
      const invalidStatuses = ['Active', 'Completed', 'Pending', ''];
      
      invalidStatuses.forEach(status => {
        expect(() => OpportunityStatusSchema.parse(status)).toThrow();
      });
    });
  });

  describe('RoleStatusSchema', () => {
    it('should validate valid role statuses', () => {
      const validStatuses = ['Open', 'Staffed', 'Won', 'Lost'];
      
      validStatuses.forEach(status => {
        expect(() => RoleStatusSchema.parse(status)).not.toThrow();
      });
    });
  });

  describe('MemberSchema', () => {
    const validMember = {
      id: 1,
      fullName: 'John Doe',
      actualGrade: 'SE',
      allocation: 75,
      availableFrom: '2024-01-15'
    };

    it('should validate a valid member', () => {
      expect(() => MemberSchema.parse(validMember)).not.toThrow();
    });

    it('should reject member with invalid data', () => {
      const invalidMembers = [
        { ...validMember, id: -1 }, // Invalid ID
        { ...validMember, fullName: '' }, // Empty name
        { ...validMember, actualGrade: 'INVALID' }, // Invalid grade
        { ...validMember, allocation: 150 }, // Invalid allocation
        { ...validMember, availableFrom: 'not-a-date' }, // Invalid date
      ];

      invalidMembers.forEach(member => {
        expect(() => MemberSchema.parse(member)).toThrow();
      });
    });
  });

  describe('RoleSchema', () => {
    const validRole = {
      id: 1,
      roleName: 'Senior Developer',
      requiredGrade: 'SE',
      status: 'Open',
      assignedMember: null,
      needsHire: true,
      comments: 'Urgent requirement'
    };

    it('should validate a valid role', () => {
      expect(() => RoleSchema.parse(validRole)).not.toThrow();
    });

    it('should validate role with assigned member', () => {
      const roleWithMember = {
        ...validRole,
        assignedMember: {
          id: 1,
          fullName: 'Jane Smith',
          actualGrade: 'SE',
          allocation: 100,
          availableFrom: '2024-01-01'
        }
      };

      expect(() => RoleSchema.parse(roleWithMember)).not.toThrow();
    });

    it('should reject role with invalid data', () => {
      const invalidRoles = [
        { ...validRole, roleName: '' }, // Empty role name
        { ...validRole, requiredGrade: 'INVALID' }, // Invalid grade
        { ...validRole, status: 'UNKNOWN' }, // Invalid status
      ];

      invalidRoles.forEach(role => {
        expect(() => RoleSchema.parse(role)).toThrow();
      });
    });
  });

  describe('OpportunitySchema', () => {
    const validOpportunity = {
      id: 1,
      clientName: 'Acme Corp',
      opportunityName: 'Digital Transformation',
      openDate: '2024-01-01',
      expectedStartDate: '2024-02-01',
      probability: 75,
      status: 'In Progress',
      roles: []
    };

    it('should validate a valid opportunity', () => {
      expect(() => OpportunitySchema.parse(validOpportunity)).not.toThrow();
    });

    it('should validate opportunity with roles', () => {
      const opportunityWithRoles = {
        ...validOpportunity,
        roles: [
          {
            id: 1,
            roleName: 'Tech Lead',
            requiredGrade: 'SC',
            status: 'Open',
            assignedMember: null,
            needsHire: true,
            comments: 'Critical role'
          }
        ]
      };

      expect(() => OpportunitySchema.parse(opportunityWithRoles)).not.toThrow();
    });

    it('should reject opportunity with invalid data', () => {
      const invalidOpportunities = [
        { ...validOpportunity, id: 0 }, // Invalid ID
        { ...validOpportunity, clientName: '' }, // Empty client name
        { ...validOpportunity, opportunityName: '' }, // Empty opportunity name
        { ...validOpportunity, openDate: 'invalid-date' }, // Invalid date format
        { ...validOpportunity, probability: 150 }, // Invalid probability
        { ...validOpportunity, status: 'UNKNOWN' }, // Invalid status
      ];

      invalidOpportunities.forEach(opp => {
        expect(() => OpportunitySchema.parse(opp)).toThrow();
      });
    });
  });

  describe('CreateOpportunityInputSchema', () => {
    const validInput = {
      clientName: 'Test Client',
      opportunityName: 'Test Opportunity',
      expectedStartDate: '2024-06-01',
      probability: 50
    };

    it('should validate valid input', () => {
      expect(() => CreateOpportunityInputSchema.parse(validInput)).not.toThrow();
    });

    it('should reject invalid input', () => {
      const invalidInputs = [
        { ...validInput, clientName: '' },
        { ...validInput, opportunityName: '' },
        { ...validInput, expectedStartDate: 'invalid' },
        { ...validInput, probability: -10 },
      ];

      invalidInputs.forEach(input => {
        expect(() => CreateOpportunityInputSchema.parse(input)).toThrow();
      });
    });
  });

  describe('CreateRoleInputSchema', () => {
    const validInput = {
      roleName: 'Developer',
      requiredGrade: 'SE',
      needsHire: 'Yes',
      comments: 'Test comment'
    };

    it('should validate valid input', () => {
      expect(() => CreateRoleInputSchema.parse(validInput)).not.toThrow();
    });

    it('should accept both Yes and No for needsHire', () => {
      expect(() => CreateRoleInputSchema.parse({ ...validInput, needsHire: 'Yes' })).not.toThrow();
      expect(() => CreateRoleInputSchema.parse({ ...validInput, needsHire: 'No' })).not.toThrow();
    });
  });
});

describe('Validation Functions', () => {
  const validOpportunity = {
    id: 1,
    clientName: 'Test Client',
    opportunityName: 'Test Opportunity',
    openDate: '2024-01-01',
    expectedStartDate: '2024-02-01',
    probability: 75,
    status: 'In Progress',
    roles: []
  };

  describe('validateOpportunity', () => {
    it('should return success for valid opportunity', () => {
      const result = validateOpportunity(validOpportunity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validOpportunity);
      }
    });

    it('should return error for invalid opportunity', () => {
      const invalidOpportunity = { ...validOpportunity, clientName: '' };
      const result = validateOpportunity(invalidOpportunity);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['clientName'],
            message: expect.stringContaining('required')
          })
        );
      }
    });
  });

  describe('validateOpportunities', () => {
    it('should validate array of valid opportunities', () => {
      const opportunities = [validOpportunity, { ...validOpportunity, id: 2 }];
      const result = validateOpportunities(opportunities);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('should reject array with invalid opportunities', () => {
      const opportunities = [validOpportunity, { ...validOpportunity, id: 'invalid' }];
      const result = validateOpportunities(opportunities);
      expect(result.success).toBe(false);
    });
  });

  describe('safeParseOpportunities', () => {
    it('should return valid opportunities when all are valid', () => {
      const opportunities = [validOpportunity, { ...validOpportunity, id: 2 }];
      const result = safeParseOpportunities(opportunities);
      expect(result).toHaveLength(2);
    });

    it('should filter out invalid opportunities and keep valid ones', () => {
      const opportunities = [
        validOpportunity,
        { ...validOpportunity, id: 'invalid' }, // Invalid
        { ...validOpportunity, id: 2 }, // Valid
        { ...validOpportunity, clientName: '' }, // Invalid
      ];
      
      const result = safeParseOpportunities(opportunities);
      expect(result).toHaveLength(2); // Only valid ones
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should return empty array for completely invalid data', () => {
      const result = safeParseOpportunities('not an array');
      expect(result).toEqual([]);
    });

    it('should return empty array for array of all invalid opportunities', () => {
      const invalidOpportunities = [
        { id: 'invalid' },
        { clientName: '' },
        { probability: 150 }
      ];
      
      const result = safeParseOpportunities(invalidOpportunities);
      expect(result).toEqual([]);
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complex opportunity with nested validation errors', () => {
    const complexOpportunity = {
      id: 1,
      clientName: 'Valid Client',
      opportunityName: 'Valid Opportunity',
      openDate: '2024-01-01',
      expectedStartDate: '2024-02-01',
      probability: 75,
      status: 'In Progress',
      roles: [
        {
          id: 1,
          roleName: 'Valid Role',
          requiredGrade: 'SE',
          status: 'Open',
          assignedMember: {
            id: 1,
            fullName: 'John Doe',
            actualGrade: 'INVALID_GRADE', // This will cause validation error
            allocation: 100,
            availableFrom: '2024-01-01'
          },
          needsHire: false,
          comments: 'Test'
        }
      ]
    };

    const result = validateOpportunity(complexOpportunity);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      // Should have nested validation error for the member's grade
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: expect.arrayContaining(['roles', 0, 'assignedMember', 'actualGrade'])
        })
      );
    }
  });

  it('should provide detailed error messages for each field', () => {
    const invalidOpportunity = {
      id: -1, // Invalid
      clientName: '', // Invalid
      opportunityName: '', // Invalid
      openDate: 'invalid-date', // Invalid
      expectedStartDate: 'invalid-date', // Invalid
      probability: 150, // Invalid
      status: 'INVALID_STATUS', // Invalid
      roles: [] // Valid
    };

    const result = validateOpportunity(invalidOpportunity);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errorPaths = result.error.issues.map(issue => issue.path.join('.'));
      expect(errorPaths).toContain('id');
      expect(errorPaths).toContain('clientName');
      expect(errorPaths).toContain('opportunityName');
      expect(errorPaths).toContain('openDate');
      expect(errorPaths).toContain('expectedStartDate');
      expect(errorPaths).toContain('probability');
      expect(errorPaths).toContain('status');
    }
  });
}); 