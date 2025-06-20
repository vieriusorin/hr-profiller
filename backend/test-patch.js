// Simple test script to verify PATCH functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testPatchEmployee() {
  try {
    console.log('🔍 Getting all employees...');
    const allEmployeesResponse = await axios.get(`${BASE_URL}/employees`);
    
    if (allEmployeesResponse.data.data.length === 0) {
      console.log('❌ No employees found to test with');
      return;
    }

    const employee = allEmployeesResponse.data.data[0];
    const employeeId = employee.id;
    
    console.log(`📋 Testing with employee: ${employee.firstName} ${employee.lastName} (ID: ${employeeId})`);
    console.log(`🔧 Current position: ${employee.position}`);
    console.log(`💰 Current salary: ${employee.salary}`);
    
    // Test PATCH update
    const patchData = {
      position: 'Updated Test Position',
      salary: 99999,
      location: 'Test Location'
    };
    
    console.log('\n🚀 Sending PATCH request...');
    console.log('Patch data:', patchData);
    
    const patchResponse = await axios.patch(`${BASE_URL}/employees/${employeeId}`, patchData);
    console.log('✅ PATCH response status:', patchResponse.status);
    console.log('📝 Updated employee data:', {
      position: patchResponse.data.data.position,
      salary: patchResponse.data.data.salary,
      location: patchResponse.data.data.location
    });
    
    // Verify with GET request
    console.log('\n🔍 Verifying with GET request...');
    const getResponse = await axios.get(`${BASE_URL}/employees/${employeeId}`);
    const updatedEmployee = getResponse.data.data;
    
    console.log('📋 GET response data:', {
      position: updatedEmployee.position,
      salary: updatedEmployee.salary,
      location: updatedEmployee.location
    });
    
    // Check if changes were applied
    const success = 
      updatedEmployee.position === patchData.position &&
      updatedEmployee.salary === patchData.salary &&
      updatedEmployee.location === patchData.location;
    
    if (success) {
      console.log('\n✅ SUCCESS: PATCH update was applied correctly!');
    } else {
      console.log('\n❌ FAILURE: PATCH update was not applied correctly');
      console.log('Expected:', patchData);
      console.log('Actual:', {
        position: updatedEmployee.position,
        salary: updatedEmployee.salary,
        location: updatedEmployee.location
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing PATCH:', error.response?.data || error.message);
  }
}

// Run the test
testPatchEmployee(); 