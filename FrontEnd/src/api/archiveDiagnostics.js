// Task Archive Test Utility
import axios from 'axios';

// Create a separate API client for direct testing
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

/**
 * This utility provides a comprehensive test flow for the entire archiving process
 * It tests each step independently to help diagnose where issues might be occurring
 */
export async function runArchiveTaskDiagnostics(taskId) {
  console.group(`🔍 Archive Task Diagnostics for ID: ${taskId}`);
  const results = [];
  
  // Step 1: Verify input
  try {
    const parsedId = parseInt(taskId, 10);
    if (isNaN(parsedId)) {
      throw new Error(`Cannot convert "${taskId}" to a valid task ID`);
    }
    
    results.push({
      step: 'Input Validation',
      success: true,
      message: `Task ID ${parsedId} is valid`,
      details: { originalId: taskId, parsedId }
    });
    
    // Continue with the parsed ID
    taskId = parsedId;
  } catch (error) {
    results.push({
      step: 'Input Validation',
      success: false,
      message: error.message,
      details: { error: error.toString(), originalId: taskId }
    });
    console.groupEnd();
    return results;
  }

  // Step 2: Check if task exists
  try {
    console.log(`Checking if task ${taskId} exists...`);
    const tasksResponse = await API.get('/tasks');
    const task = tasksResponse.data.find(t => t.id === taskId);
    
    if (task) {
      results.push({
        step: 'Task Existence Check',
        success: true,
        message: `Task ${taskId} exists`,
        details: { task }
      });
    } else {
      results.push({
        step: 'Task Existence Check',
        success: false,
        message: `Task ${taskId} not found in active tasks`,
        details: { availableTasks: tasksResponse.data }
      });
      // Continue anyway to see what the API returns
    }
  } catch (error) {
    results.push({
      step: 'Task Existence Check',
      success: false,
      message: `Error checking task existence: ${error.message}`,
      details: { error: error.toString() }
    });
  }
  
  // Step 3: Test direct API connection with proper payload format
  try {
    console.log(`Making direct API call to archive task ${taskId}...`);
    const payload = { task_id: taskId };
    console.log(`Archive payload:`, payload);
    
    const directApiResponse = await API.post('/archive', payload);
    
    results.push({
      step: 'Direct API Call',
      success: true,
      message: 'Direct API call successful',
      details: { 
        status: directApiResponse.status,
        data: directApiResponse.data
      }
    });
  } catch (error) {
    results.push({
      step: 'Direct API Call',
      success: false,
      message: `Error in direct API call: ${error.message}`,
      details: { 
        error: error.toString(),
        response: error.response?.data,
        status: error.response?.status
      }
    });
  }
  
  // Step 4: Verify task was moved to archives
  try {
    console.log(`Checking if task was moved to archives...`);
    const archivesResponse = await API.get('/archives');
    const archived = archivesResponse.data.find(a => a.Finished === results[1].details?.task?.TODO);
    
    if (archived) {
      results.push({
        step: 'Archive Verification',
        success: true,
        message: `Task successfully moved to archives with ID: ${archived.id}`,
        details: { archivedTask: archived }
      });
    } else {
      results.push({
        step: 'Archive Verification',
        success: false,
        message: 'Task not found in archives after archive attempt',
        details: { archives: archivesResponse.data }
      });
    }
  } catch (error) {
    results.push({
      step: 'Archive Verification',
      success: false,
      message: `Error checking archives: ${error.message}`,
      details: { error: error.toString() }
    });
  }
  
  console.log('📋 Archive Task Diagnostics Results:');
  results.forEach(r => {
    console.log(
      `${r.success ? '✅' : '❌'} ${r.step}: ${r.message}`
    );
  });
  console.groupEnd();
  
  return results;
}

// Set up global access for console testing
window.runArchiveTaskDiagnostics = runArchiveTaskDiagnostics;

// Export other testing utilities
export { API };
