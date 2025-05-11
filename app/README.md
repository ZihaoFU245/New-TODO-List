# Flask TODO List Backend

This is the backend API for the TODO List project, built with Flask.

## Features
- Add new tasks
- Archive tasks
- Unarchive tasks
- Permanently delete archived tasks
- Paginated retrieval of tasks and archives
- Flexible sync endpoint for efficient data transfer

## Running the Backend
1. Install dependencies: `pip install flask` (and any others)
2. Run: `python run.py`

## API Endpoints

All endpoints are prefixed with `/api`.

### Add a Task
- `POST /api/add`
- Body: `{ "task_description": "string" }`
- Response: `{ "message": "Task added successfully" }`

### Archive a Task
- `POST /api/archive`
- Body: `{ "task_id": <int> }`
- Response: `{ "message": "Task archived successfully", "archived_task_id": <int> }`

### Unarchive a Task
- `POST /api/unArchive`
- Body: `{ "archive_id": <int> }`
- Response: `{ "message": "Task unArchived succesfully", "task_id": <int> }`

### Permanently Delete an Archived Task
- `POST /api/perm_delete`
- Body: `{ "archive_id": <int> }`
- Response: `{ "message": "Archive permanently deleted successfully" }`

### Get Active Tasks
- `GET /api/tasks?page=<int>`
- Response: `[ { "id": <int>, "TODO": "string" }, ... ]`

### Get Archived Tasks
- `GET /api/archives?page=<int>`
- Response: `[ { "id": <int>, "Finished": "string" }, ... ]`

### Sync Data
- `POST /api/sync`
- Body: Flexible, e.g. `{ "fetch_tasks": true, "tasks_page": 1 }`
- Response: Only requested data, e.g. `{ "tasks": [ ... ], "archives": [ ... ] }`

See `control_endpoints.py` for full details.
