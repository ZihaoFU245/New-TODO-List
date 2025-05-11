// Test script to check backend connectivity
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Function to test all endpoints
async function testAllConnections() {
  console.log('Testing backend connections to:', BASE_URL);
  
  const endpoints = [
    { url: '/tasks', method: 'get', name: 'Get Tasks' },
    { url: '/archives', method: 'get', name: 'Get Archives' },
    { url: '/add', method: 'post', data: { task_description: 'Test task' }, name: 'Add Task' },
    // The following tests require valid IDs, so they're commented out by default
    // { url: '/archive', method: 'post', data: { task_id: 1 }, name: 'Archive Task' },
    // { url: '/perm_delete', method: 'post', data: { archive_id: 1 }, name: 'Delete Archive' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      
      let response;
      if (endpoint.method === 'get') {
        response = await axios.get(`${BASE_URL}${endpoint.url}`);
      } else if (endpoint.method === 'post') {
        response = await axios.post(`${BASE_URL}${endpoint.url}`, endpoint.data);
      }
      
      console.log(`${endpoint.name} - Connection successful!`);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
    } catch (error) {
      console.error(`${endpoint.name} - Connection failed!`);
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    
    console.log('----------------------------');
  }
}

// Run the tests
testAllConnections();
