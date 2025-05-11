import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from '../utils/performance'

export default function TodoItem({ todo, onToggle, onDelete, actionLabel = "Delete" }) {
  // Debug: Log todo object to help diagnose issues
  useEffect(() => {
    console.log('TodoItem received todo:', todo);
  }, [todo]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Create a debounced version of the onToggle function to prevent rapid multiple calls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedToggle = useCallback(
    debounce((todoItem) => {
      onToggle(todoItem);
      setIsCompleting(false);
    }, 100),
    [onToggle]
  );  // Handle the completion animation  
  const handleToggle = useCallback(() => {
    // First, log the todo object to help diagnose issues
    console.log('Toggle initiated for todo:', todo);
    
    // Validate that we have a valid ID before proceeding
    if (!todo.id) {
      console.error('Todo item missing ID:', todo);
      return;
    }
    
    // Check if this is a temporary ID (not ready for server operations)
    if (typeof todo.id === 'string' && todo.id.startsWith('temp-')) {
      console.warn('Cannot complete/archive a task with temporary ID:', todo.id);
      alert('This task is still being saved. Please wait a moment and try again.');
      return;
    }
    
    if (!todo.completed && !isCompleting) {
      setIsCompleting(true);
      setIsAnimating(true);
      
      // After animation completes, call the debounced onToggle handler
      setTimeout(() => {
        console.log('Animation completed, calling toggle for:', todo);
        
        // Create a normalized todo object to ensure consistent structure
        const normalizedTodo = {
          ...todo,
          // Ensure the ID is present and correct (as a number)
          id: typeof todo.id === 'string' ? parseInt(todo.id, 10) : todo.id,
          // Ensure task field is present
          task: todo.task || todo.TODO || ''
        };
        
        console.log('Normalized todo for toggle:', normalizedTodo);
        debouncedToggle(normalizedTodo);
      }, 600); // Match animation duration
    } else if (todo.completed) {
      // If already completed, just call onToggle immediately
      console.log('Todo already completed, toggling immediately:', todo);
      
      // Also normalize in this case
      const normalizedTodo = {
        ...todo,
        id: typeof todo.id === 'string' ? parseInt(todo.id, 10) : todo.id,
        task: todo.task || todo.TODO || ''
      };
      
      onToggle(normalizedTodo);
    }
  }, [todo, isCompleting, debouncedToggle, onToggle]);

  // Reset animation state when todo changes
  useEffect(() => {
    setIsAnimating(false);
    setIsCompleting(false);
  }, [todo.id]);

  return (
    <div className="flex items-center justify-between p-4 mb-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-200 transform hover:translate-x-1">
      <label className="flex items-center space-x-3 flex-grow cursor-pointer">
        <input
          type="checkbox"
          checked={todo.completed || isCompleting}
          onChange={handleToggle}
          disabled={isCompleting}
          className="form-checkbox h-5 w-5 text-indigo-600 dark:text-indigo-400 rounded border-gray-300 dark:border-gray-500 transition duration-150 ease-in-out focus:ring-indigo-500 dark:focus:ring-indigo-400"
        />
        <div className="relative">
          <span className={`text-gray-800 dark:text-gray-200 transition-all duration-150 ${
            todo.completed ? 'text-gray-500 dark:text-gray-400' : ''
          }`}>
            {todo.task}
          </span>
          
          {/* Pencil strike-through animation */}
          {isAnimating && (
            <svg 
              className="absolute top-1/2 left-0 h-0.5 animate-pencil-strike" 
              width="100%" 
              height="2" 
              viewBox="0 0 100 2" 
              preserveAspectRatio="none"
            >
              <line 
                x1="0" 
                y1="1" 
                x2="100" 
                y2="1" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                className="text-red-500 dark:text-red-400"
                strokeDasharray="100"
                strokeDashoffset="100"
                style={{
                  animation: 'pencil-draw 0.4s ease-in-out 0.1s forwards',
                }}
              />
            </svg>
          )}
          
          {/* Permanent strike-through for completed items */}
          {todo.completed && (
            <div className="absolute top-1/2 left-0 h-0.5 w-full bg-gray-500 dark:bg-gray-400"></div>
          )}
        </div>
      </label>
      <div className="flex space-x-2">
        <button 
          onClick={() => onDelete(todo)} 
          disabled={isCompleting}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-150 ${
            isCompleting ? 'opacity-50 cursor-not-allowed ' :
            actionLabel === "Delete" 
              ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800" 
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
          }`}
        >
          {actionLabel === "Delete" ? (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete
            </span>
          ) : (
            <span className="flex items-center">
              {isCompleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700 dark:text-indigo-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Archiving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Archive
                </>
              )}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
