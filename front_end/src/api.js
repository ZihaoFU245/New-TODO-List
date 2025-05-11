// filepath: d:\MyProject\New TODO List\front_end\src\api.js
const API_BASE_URL = 'http://localhost:5000/api'; // Assuming default backend port

async function fetchTasks(page = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks?page=${page}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return []; // Return empty array on error to prevent breaking the UI
    }
}

async function addTask(taskDescription) {
    try {
        const response = await fetch(`${API_BASE_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_description: taskDescription }),
        });
        if (!response.ok) {
            // Try to parse error message from backend if available
            const errorData = await response.json().catch(() => ({ error: 'Failed to add task and parse error json' }));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding task:', error);
        return null; // Return null on error
    }
}

async function archiveTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/archive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_id: taskId }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to archive task and parse error json' }));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error archiving task:', error);
        return null;
    }
}

async function fetchArchivedTasks(page = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/archives?page=${page}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching archived tasks:', error);
        return [];
    }
}

async function permanentlyDeleteTask(archiveId) {
    try {
        const response = await fetch(`${API_BASE_URL}/perm_delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ archive_id: archiveId }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to delete task and parse error json' }));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error permanently deleting task:', error);
        return null;
    }
}

async function syncData(options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error syncing data:', error);
        return {}; // Return empty object on error
    }
}
