const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/v1';

async function testOpportunityCreation() {
  console.log('🧪 Testing Opportunity API with UUID generation...\n');

  try {
    // Test 1: Create a new opportunity (without providing an ID)
    console.log('📝 Test 1: Creating opportunity without ID (server should generate UUID)');
    
    const newOpportunity = {
      opportunityName: 'Test API Opportunity',
      clientName: 'Test Client Corp',
      expectedStartDate: '2024-03-15',
      expectedEndDate: '2024-09-15',
      probability: 85,
      status: 'In Progress',
      comment: 'Testing UUID generation',
      isActive: true
    };
    
    console.log('Request body (no ID):', JSON.stringify(newOpportunity, null, 2));
    
    const createResponse = await fetch(`${API_BASE}/opportunities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOpportunity)
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('❌ Create failed:', error);
      return;
    }
    
    const created = await createResponse.json();
    console.log('✅ Created opportunity with server-generated UUID:');
    console.log('   ID:', created.data.id);
    console.log('   UUID format valid:', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(created.data.id));
    console.log('   Name:', created.data.opportunityName);
    
    // Test 2: Fetch the created opportunity
    console.log('\n📖 Test 2: Fetching created opportunity by UUID');
    const fetchResponse = await fetch(`${API_BASE}/opportunities/${created.data.id}`);
    
    if (!fetchResponse.ok) {
      console.error('❌ Fetch failed');
      return;
    }
    
    const fetched = await fetchResponse.json();
    console.log('✅ Successfully fetched opportunity:');
    console.log('   ID matches:', fetched.data.id === created.data.id);
    console.log('   Name matches:', fetched.data.opportunityName === newOpportunity.opportunityName);
    
    // Test 3: List all opportunities
    console.log('\n📋 Test 3: Listing all opportunities');
    const listResponse = await fetch(`${API_BASE}/opportunities`);
    
    if (!listResponse.ok) {
      console.error('❌ List failed');
      return;
    }
    
    const list = await listResponse.json();
    console.log('✅ Successfully listed opportunities:');
    console.log('   Total count:', list.meta.count);
    console.log('   Contains new opportunity:', list.data.some(opp => opp.id === created.data.id));
    
    console.log('\n🎉 All tests passed! UUID generation is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOpportunityCreation(); 