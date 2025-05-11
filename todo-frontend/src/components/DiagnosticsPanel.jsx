import { useState, useEffect } from 'react';
import * as api from '../api/todos';
import { runArchiveTaskDiagnostics } from '../api/archiveDiagnostics';

/**
 * A self-contained diagnostic tool for debugging Todo application issues
 * This component will run a series of tests on various API endpoints
 * and report the results visually
 */
export default function DiagnosticsPanel() {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [activeTasks, setActiveTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResponse = await api.getTodos();
        setActiveTasks(tasksResponse.data || []);
        
        const archivesResponse = await api.getArchives();
        setArchivedTasks(archivesResponse.data || []);
      } catch (error) {
        addResult('Initial Data Load', false, error.message);
      }
    };
    
    fetchData();
  }, []);
  
  const addResult = (test, success, message, details = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [
      { id: Date.now(), test, success, message, details, timestamp },
      ...prev    ]);
  };
  
  const runConnectionTest = async () => {
    setRunning(true);
    addResult('API Connection Test', true, 'Starting comprehensive connection tests...');
    
    // Use the API from archiveDiagnostics for direct API access
    const { API } = await import('../api/archiveDiagnostics');
    
    // Check server connectivity first
    try {
      // Simple GET request to validate the backend is running
      const startTime = Date.now();
      const tasksResponse = await API.get('/tasks');
      const endTime = Date.now();
      
      addResult(
        'Backend Connectivity', 
        true, 
        `Connected to backend (response time: ${endTime - startTime}ms)`,
        {
          serverUrl: API.defaults.baseURL,
          responseTime: `${endTime - startTime}ms`
        }
      );
    } catch (error) {
      addResult(
        'Backend Connectivity', 
        false, 
        'Failed to connect to backend server', 
        {
          serverUrl: API.defaults.baseURL,
          error: error.message,
          networkError: error.isAxiosError
        }
      );
      
      // If we can't connect to the backend, no need to run other tests
      addResult('Connection Tests', false, 'Aborting remaining tests due to connection failure');
      setRunning(false);
      return;
    }
    
    // Test getTodos API with standard library
    try {
      const tasksResponse = await api.getTodos();
      addResult(
        'GET /tasks', 
        true, 
        `Retrieved ${tasksResponse.data.length} tasks`,
        {
          tasks: tasksResponse.data.slice(0, 3).map(t => ({ id: t.id, content: t.TODO })),
          totalCount: tasksResponse.data.length
        }
      );
      setActiveTasks(tasksResponse.data || []);
    } catch (error) {
      addResult('GET /tasks', false, 'Failed to retrieve tasks', error);
    }
    
    // Test getArchives API
    try {
      const archivesResponse = await api.getArchives();
      addResult(
        'GET /archives', 
        true, 
        `Retrieved ${archivesResponse.data.length} archived tasks`,
        {
          archives: archivesResponse.data.slice(0, 3).map(a => ({ id: a.id, content: a.Finished })),
          totalCount: archivesResponse.data.length
        }
      );
      setArchivedTasks(archivesResponse.data || []);
    } catch (error) {
      addResult('GET /archives', false, 'Failed to retrieve archives', error);
    }
    
    // Test addTodo API
    try {
      const testTaskText = `Test task ${Date.now()}`;
      addResult('POST /add', true, `Attempting to create test task: "${testTaskText}"`);
      
      const addResponse = await api.addTodo(testTaskText);
      
      addResult(
        'POST /add Result', 
        true, 
        'Successfully created test task', 
        {
          request: { task_description: testTaskText },
          response: addResponse.data,
          status: addResponse.status
        }
      );
      
      // Refresh tasks list after adding
      const refreshResponse = await api.getTodos();
      setActiveTasks(refreshResponse.data || []);
      
      // Try to find the newly created task
      const newTask = refreshResponse.data.find(task => task.TODO === testTaskText);
      if (newTask) {
        addResult(
          'Task Creation Verification', 
          true,
          `Verified new task was created with ID: ${newTask.id}`,
          { task: newTask }
        );
      } else {
        addResult(
          'Task Creation Verification', 
          false,
          'Could not verify new task was created',
          { allTasks: refreshResponse.data.map(t => ({ id: t.id, content: t.TODO })) }
        );
      }
    } catch (error) {
      addResult(
        'POST /add', 
        false, 
        'Failed to add test task', 
        {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      );
    }
      setRunning(false);
  };
  
  const testArchiveTask = async () => {
    if (!selectedTaskId) {
      addResult('Archive Test', false, 'No task selected');
      return;
    }
    
    setRunning(true);
    addResult('Archive Task Test', true, `Starting comprehensive archive diagnostics for task ID: ${selectedTaskId}`);
    
    try {
      // First run the standard API call
      try {
        const taskId = parseInt(selectedTaskId, 10);
        
        if (isNaN(taskId)) {
          addResult('Archive Test', false, 'Invalid task ID (not a number)');
        } else {
          addResult('Standard API Call', true, `Sending archive request for task ID: ${taskId}`);
          const response = await api.archiveTodo(taskId);
          addResult(
            'Standard API Call', 
            true, 
            `Archive API call successful! New archive ID: ${response.data.archived_task_id}`,
            response.data
          );
        }
      } catch (error) {
        addResult(
          'Standard API Call', 
          false, 
          'Regular archive API call failed', 
          {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          }
        );
      }
      
      // Then run the comprehensive diagnostics
      addResult('Diagnostics', true, 'Running comprehensive archive diagnostics...');
      const diagnosticResults = await runArchiveTaskDiagnostics(selectedTaskId);
      
      // Add each diagnostic step to our results
      diagnosticResults.forEach(result => {
        addResult(
          `Diagnostic: ${result.step}`,
          result.success,
          result.message,
          result.details
        );
      });
      
      // Refresh both lists
      const [tasksResponse, archivesResponse] = await Promise.all([
        api.getTodos(),
        api.getArchives()
      ]);
      
      setActiveTasks(tasksResponse.data || []);
      setArchivedTasks(archivesResponse.data || []);
    } catch (error) {
      addResult(
        'Archive Test', 
        false, 
        'Error running diagnostics', 
        {
          message: error.message
        }
      );
    }
    
    setRunning(false);
  };
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">API Diagnostics</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Active Tasks</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-h-40 overflow-y-auto">
            {activeTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No active tasks found</p>
            ) : (
              <ul className="list-disc list-inside">
                {activeTasks.map(task => (
                  <li key={task.id} 
                      className="mb-1 flex justify-between items-center">
                    <span className="truncate">
                      {task.TODO || task.task} 
                      <span className="text-xs text-gray-500 ml-1">[ID: {task.id}]</span>
                    </span>
                    <button
                      className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Archived Tasks</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-h-40 overflow-y-auto">
            {archivedTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No archived tasks found</p>
            ) : (
              <ul className="list-disc list-inside">
                {archivedTasks.map(archive => (
                  <li key={archive.id} className="mb-1">
                    {archive.Finished || archive.task}
                    <span className="text-xs text-gray-500 ml-1">[ID: {archive.id}]</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task ID for Archive Test
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              placeholder="Enter task ID"
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={testArchiveTask}
              disabled={running || !selectedTaskId}
              className={`px-4 py-2 rounded-md text-white ${
                running || !selectedTaskId 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Test Archive
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select a task from the list above or enter an ID manually
          </p>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={runConnectionTest}
          disabled={running}
          className={`px-6 py-2 rounded-md text-white font-medium ${
            running ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {running ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Tests...
            </span>
          ) : 'Run Connection Test'}
        </button>
      </div>
      
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Test Results</h3>
        <div className="max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <p className="p-4 text-gray-500 dark:text-gray-400">No tests run yet</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map(result => (
                <li key={result.id} className="p-4">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                      result.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {result.success ? (
                        <span className="text-green-600 dark:text-green-300">✓</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-300">✗</span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {result.test}
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {result.timestamp}
                        </span>
                      </p>
                      <p className={`text-sm ${
                        result.success ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {result.message}
                      </p>
                      {result.details && (
                        <details className="mt-1">
                          <summary className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 text-xs bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
