# TODO List API Backend

This project is a Flask-based backend for a TODO List application. It provides API endpoints for managing tasks, including adding, archiving, and permanently deleting tasks, as well as retrieving lists of current and archived tasks with pagination.

## Project Structure

```
/
├── app/                    # Main application package
│   ├── __init__.py         # Application factory and initialization
│   ├── control_endpoints.py # API endpoint definitions
│   ├── MyTODO.db           # SQLite database file (created on first run if not present)
│   ├── config/             # Configuration files
│   │   ├── __init__.py
│   │   └── settings.py     # Application settings (PORT, DATABASE_URI, etc.)
│   ├── models/             # Database models and business logic
│   │   ├── __init__.py
│   │   ├── control.py      # Business logic for task management
│   │   └── database.py     # SQLAlchemy models and database setup
│   └── logs/               # Log files (created by the application)
│       └── app.log
├── run.py                  # Script to run the Flask application
├── test_app.py             # Unit tests for the application
└── README.md               # This file
```

## Prerequisites

*   Python 3.x
*   pip (Python package installer)

## Setup

1.  **Clone the repository (if applicable) or ensure you have the project files.**
2.  **Navigate to the project directory:**
    ```powershell
    cd "d:\\MyProject\\New TODO List"
    ```
3.  **Create a virtual environment (recommended):**
    ```powershell
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    ```
4.  **Install dependencies:**
    This project uses Flask and SQLAlchemy. You will need to install them. If a `requirements.txt` file is available, use:
    ```powershell
    pip install -r requirements.txt
    ```
    Otherwise, install the packages manually:
    ```powershell
    pip install Flask SQLAlchemy
    ```

## Running the Application

To run the application, execute the `run.py` script from the project root directory:

```powershell
python run.py
```

The application will start, and by default, it will be accessible at `http://localhost:5000` (or the port specified in `app/config/settings.py`). The API endpoints will be available under the `/api` prefix.

The application uses an SQLite database (`MyTODO.db`) which will be created in the `app` directory if it doesn't already exist when the application starts.

## Logging

The application logs events to `app/logs/app.log`. This includes errors, warnings, and informational messages about application activity (e.g., task archiving, database initialization). The logging uses a `RotatingFileHandler` with a max size of 1MB and keeps one backup file.

## Configuration

Application settings can be configured in `app/config/settings.py`. Key settings include:
*   `PORT`: The port on which the application runs.
*   `DATABASE_URI`: The connection string for the database.
*   `TASKS_PER_PAGE`: The number of items to return per page for paginated endpoints.
*   `DEBUG`: Enables or disables debug mode for Flask.

## API Endpoints

All API endpoints are prefixed with `/api`.

---

### 1. Add a New Task

*   **URL:** `/add`
*   **Method:** `POST`
*   **Description:** Adds a new task to the TODO list.
*   **Request Body:** JSON
    ```json
    {
        "task_description": "Your new task details here"
    }
    ```
    *   `task_description` (string, required): The description of the task. Max length is 255 characters (will be truncated if longer).
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
    *   **Content (Example):**
        ```json
        {
            "error": "task description is required"
        }
        ```

---

### 2. Archive a Task

*   **URL:** `/archive`
*   **Method:** `POST`
*   **Description:** Moves a task from the active TODO list to the archive.
*   **Request Body:** JSON
    ```json
    {
        "task_id": 123
    }
    ```
    *   `task_id` (integer, required): The ID of the task to archive.
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content:**
        ```json
        {
            "message": "Task archived successfully",
            "archived_task_id": 456
        }
        ```
        (where `archived_task_id` is the new ID of the task in the archive table)
*   **Error Responses:**
    *   **Code:** `400 BAD REQUEST`
    *   **Content (Example):**
        ```json
        {
            "error": "task_id is required"
        }
        ```
    *   **Code:** `404 NOT FOUND`
    *   **Content (Example):**
        ```json
        {
            "error": "Failed to archive task or task not found"
        }
        ```

---

### 3. Permanently Delete an Archived Task

*   **URL:** `/perm_delete`
*   **Method:** `POST`
*   **Description:** Permanently deletes a task from the archive.
*   **Request Body:** JSON
    ```json
    {
        "archive_id": 456
    }
    ```
    *   `archive_id` (integer, required): The ID of the archived task to delete.
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content:**
        ```json
        {
            "message": "Archive permanently deleted successfully"
        }
        ```
*   **Error Responses:**
    *   **Code:** `400 BAD REQUEST`
    *   **Content (Example):**
        ```json
        {
            "error": "archive_id is required"
        }
        ```
    *   **Code:** `404 NOT FOUND`
    *   **Content (Example):**
        ```json
        {
            "error": "Failed to delete archive or archive not found"
        }
        ```

---

### 4. Get Active Tasks

*   **URL:** `/tasks`
*   **Method:** `GET`
*   **Description:** Retrieves a paginated list of active (non-archived) tasks. Tasks are returned in descending order of their ID (newest first).
*   **Query Parameters:**
    *   `page` (integer, optional, default: `1`): The page number to retrieve.
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content (Example for page with tasks):**
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
    *   **Content (Example for empty page or no tasks):**
        ```json
        []
        ```

---

### 5. Get Archived Tasks

*   **URL:** `/archives`
*   **Method:** `GET`
*   **Description:** Retrieves a paginated list of archived tasks. Archives are returned in descending order of their ID (newest first).
*   **Query Parameters:**
    *   `page` (integer, optional, default: `1`): The page number to retrieve.
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Content (Example for page with archives):**
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
    *   **Content (Example for empty page or no archives):**
        ```json
        []
        ```

---

## Running Tests

Unit tests are located in `test_app.py` and can be run using `pytest`.

1.  **Ensure `pytest` is installed:**
    ```powershell
    pip install pytest
    ```
2.  **Run tests from the project root directory:**
    ```powershell
    pytest
    ```

This will execute all tests and report the results. The tests use an in-memory SQLite database and do not affect the `MyTODO.db` file.
