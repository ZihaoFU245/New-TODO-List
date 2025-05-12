import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // adjust if needed
})

export const getTodos = () => API.get('/tasks')
export const addTodo = (text) => API.post('/add', { task_description: text })
export const archiveTodo = (id) => {
  // Ensure we have a valid ID
  if (id === undefined || id === null) {
    console.error('Invalid ID passed to archiveTodo:', id);
    return Promise.reject(new Error('Invalid task ID'));
  }
  
  // Check if the ID is a temporary ID (starts with 'temp-')
  if (typeof id === 'string' && id.startsWith('temp-')) {
    console.warn('Attempting to archive a task with a temporary ID:', id);
    // Return a special promise that will be handled by the optimistic update
    return {
      status: 'pending',
      message: 'Task still saving to server',
      tempId: id
    };
  }
  
  // Convert ID to integer and provide detailed logging
  const taskId = parseInt(id, 10);
  
  if (isNaN(taskId)) {
    console.error('Failed to parse ID in archiveTodo:', id);
    return Promise.reject(new Error(`Cannot convert "${id}" to a valid task ID`));
  }
  
  console.log('Making archive API call with task_id:', taskId);
  
  // Ensure the data is properly formatted with just the number
  return API.post('/archive', { task_id: taskId });
}
export const deleteTodo = (id) => {
  // Ensure we have a valid ID
  if (id === undefined || id === null) {
    console.error('Invalid ID passed to deleteTodo:', id);
    return Promise.reject(new Error('Invalid archive ID'));
  }
  
  // Convert ID to integer and provide detailed logging
  const archiveId = parseInt(id, 10);
  
  if (isNaN(archiveId)) {
    console.error('Failed to parse ID in deleteTodo:', id);
    return Promise.reject(new Error(`Cannot convert "${id}" to a valid archive ID`));
  }
  
  console.log('Making delete API call with archive_id:', archiveId);
  return API.post('/perm_delete', { archive_id: archiveId });
}
export const getArchives = () => API.get('/archives')
