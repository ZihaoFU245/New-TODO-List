# React TODO List Frontend

This is the frontend for the TODO List project, built with React and Vite.

## Features
- Add, archive, and delete tasks
- View active and archived tasks
- Modern, responsive UI
- Optimistic UI updates for fast feedback
- Error handling and loading states

## Running the Frontend
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`

## Project Structure
- `src/components/` - UI components (TodoList, TodoItem, etc.)
- `src/api/` - API functions for backend communication
- `src/hooks/` - Custom React hooks (e.g., `useApiCache`)
- `src/utils/` - Utility functions

## API Usage
- All API calls are made to the Flask backend at `http://localhost:5000/api`
- See `src/api/todos.js` for details

## Custom Hooks
- `useApiCache` handles caching, optimistic updates, and error/loading state for API data

## Notes
- The frontend expects backend API responses as described in the backend README
- For development, ensure the backend is running on port 5000
