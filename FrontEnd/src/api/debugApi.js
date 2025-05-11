// Debug utility for directly testing the archive API
import * as api from './todos.js';

// Function to test the archive endpoint with a specific ID
async function testArchiveApi(taskId) {
  console.log(`Testing archive API with taskId: ${taskId}`);
  try {
    const response = await api.archiveTodo(taskId);
    console.log('Archive API Response:', response);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return { success: true, response };
  } catch (error) {
    console.error('Archive API Error:', error);
    console.error('Error Response:', error.response?.data);
    console.error('Error Status:', error.response?.status);
    return { 
      success: false, 
      error,
      errorMessage: error.message,
      errorData: error.response?.data,
      errorStatus: error.response?.status 
    };
  }
}

// Export the test function for use in the console
window.testArchiveApi = testArchiveApi;

// Export for direct import
export { testArchiveApi };
