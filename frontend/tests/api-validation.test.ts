
const testApiValidation = () => {

  // Test 1: Valid opportunity data
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

  // Test 2: Invalid opportunity data
  const invalidOpportunity = {
    id: -1, // Invalid: must be positive
    clientName: '', // Invalid: required
    opportunityName: '', // Invalid: required
    openDate: 'invalid-date', // Invalid: wrong format
    probability: 150, // Invalid: must be 0-100
    status: 'UNKNOWN', // Invalid: not in enum
    roles: []
  };

  // Test 3: Partial validation with fallback
  const mixedData = [
    validOpportunity,
    invalidOpportunity,
    { ...validOpportunity, id: 2 }, // Valid
    { ...validOpportunity, id: 'string' }, // Invalid
  ];

  // Test 4: Grade validation
  const validGrades = ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'];
  const invalidGrades = ['INVALID', 'junior', '', null, 123];

  // Test 5: Form input validation
  const validCreateInput = {
    clientName: 'Test Client',
    opportunityName: 'Test Opportunity',
    expectedStartDate: '2024-06-01',
    probability: 50
  };

  const invalidCreateInput = {
    clientName: '', // Invalid
    opportunityName: '', // Invalid
    expectedStartDate: 'not-a-date', // Invalid
    probability: -10 // Invalid
  };

  return {
    validOpportunity,
    invalidOpportunity,
    mixedData,
    validGrades,
    invalidGrades,
    validCreateInput,
    invalidCreateInput
  };
};

// Export for potential use
export default testApiValidation; 