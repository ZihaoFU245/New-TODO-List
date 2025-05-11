# TODO List API Backend

This document provides instructions for integrating with the TODO List API backend. The API allows for managing tasks including adding, archiving, and deleting tasks, as well as retrieving both active and archived tasks with pagination.

## API Base URL

All API endpoints are accessible under the `/api` prefix. 

By default, the API runs at: `http://localhost:5000/api`

## Authentication

The API currently does not implement authentication. All endpoints are publicly accessible.

## Database

The backend uses an SQLite database (`app/MyTODO.db`) which is created automatically on first run if it doesn't already exist.

## Configuration

The API has the following configurable parameters in `app/config/settings.py`:

- `PORT`: The port on which the API runs (default: 5000)
- `DATABASE_URI`: The database connection string
- `TASKS_PER_PAGE`: Number of items returned per page (default: 25)

## API Reference

All endpoints are prefixed with `/api`. Below is the complete reference for all available backend API endpoints.

### 1. Add a New Task

*   **Endpoint:** `/add`
*   **Method:** `POST`
*   **Description:** Adds a new task to the TODO list
*   **Request Body:**
    ```json
    {
        "task_description": "Your new task details here"
    }
    ```
*   **Success Response:**
    *   **Code:** `201 CREATED`
    *   **Content:**
        ```json
        {
            "message": "Task added successfully"
        }
        ```
*   **Error Response:**
    *   **Code:** `400 BAD REQUEST`
    *   **Content:**
        ```json
        {
            "error": "task description is required"
        }
        ```

### 2. Archive a Task

*   **Endpoint:** `/archive`
*   **Method:** `POST`
*   **Description:** Moves a task from the active list to the archive
*   **Request Body:**
    ```json
    {
        "task_id": 123
    }
    ```
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content:**
        ```json
        {
            "message": "Task archived successfully",
            "archived_task_id": 456
        }
        ```
*   **Error Responses:**
    *   **Code:** `400 BAD REQUEST` - When task_id is missing
    *   **Code:** `404 NOT FOUND` - When task doesn't exist or couldn't be archived

### 3. Permanently Delete an Archived Task

*   **Endpoint:** `/perm_delete`
*   **Method:** `POST` 
*   **Description:** Permanently deletes a task from the archive
*   **Request Body:**
    ```json
    {
        "archive_id": 456
    }
    ```
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content:**
        ```json
        {
            "message": "Archive permanently deleted successfully"
        }
        ```
*   **Error Responses:**
    *   **Code:** `400 BAD REQUEST` - When archive_id is missing
    *   **Code:** `404 NOT FOUND` - When archive doesn't exist or couldn't be deleted

### 4. Get Active Tasks

*   **Endpoint:** `/tasks`
*   **Method:** `GET`
*   **Description:** Retrieves paginated list of active tasks (newest first)
*   **Query Parameters:**
    *   `page` (integer, optional, default: `1`)
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content:**
        ```json
        [
            {
                "id": 102,
                "TODO": "Recently added task"
            },
            {
                "id": 101,
                "TODO": "Older task"
            }
        ]
        ```

### 5. Get Archived Tasks

*   **Endpoint:** `/archives`
*   **Method:** `GET`
*   **Description:** Retrieves paginated list of archived tasks (newest first)
*   **Query Parameters:**
    *   `page` (integer, optional, default: `1`)
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content:**
        ```json
        [
            {
                "id": 78,
                "Finished": "Recently archived task content"
            },
            {
                "id": 77,
                "Finished": "Older archived task content"
            }
        ]
        ```

### 6. Sync Data

*   **Endpoint:** `/sync`
*   **Method:** `POST`
*   **Description:** Flexible endpoint to retrieve specific tasks, archives, or lists in a single request
*   **Request Body:** The request should include one or more of the following fields:
    ```json
    {
        "fetch_task_id": 123,        // Optional: ID of a specific task to fetch
        "fetch_archive_id": 456,      // Optional: ID of a specific archive to fetch
        "fetch_tasks": true,          // Optional: Set to true to fetch tasks list
        "tasks_page": 1,             // Optional: Page number for tasks (default: 1)
        "fetch_archives": true,       // Optional: Set to true to fetch archives list
        "archives_page": 1           // Optional: Page number for archives (default: 1)
    }
    ```
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content:** The response will include only the requested data:
        ```json
        {
            "task": {                    // Present if fetch_task_id was provided
                "id": 123,
                "TODO": "Task content"
            },
            "archive": {                 // Present if fetch_archive_id was provided
                "id": 456,
                "Finished": "Archived task content"
            },
            "tasks": [                   // Present if fetch_tasks was true
                {
                    "id": 102,
                    "TODO": "Task 1"
                },
                {
                    "id": 101,
                    "TODO": "Task 2"
                }
            ],
            "archives": [                // Present if fetch_archives was true
                {
                    "id": 78,
                    "Finished": "Archive 1"
                },
                {
                    "id": 77,
                    "Finished": "Archive 2"
                }
            ]
        }
        ```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

* `400 Bad Request` - When required parameters are missing
* `404 Not Found` - When requested resources don't exist
* `500 Internal Server Error` - When server-side errors occur

## Pagination

Endpoints that return lists (`/tasks`, `/archives`, and the list responses in `/sync`) 
support pagination with the following characteristics:

* Default page size: 25 items (configurable in `app/config/settings.py`)
* Page numbering starts at 1
* Results are sorted in descending order by ID (newest first)
