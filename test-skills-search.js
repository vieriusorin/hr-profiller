const http = require('http');

const testData = JSON.stringify({
  skills: ['JavaScript', 'React', 'Node.js']
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/persons/search/skills',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('Testing persons skills search endpoint...');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Body:', testData);
console.log('---');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(testData);
req.end(); 