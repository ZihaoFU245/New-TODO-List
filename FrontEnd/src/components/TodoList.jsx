import React, { useState, useEffect, memo, useCallback } from 'react'
import TodoItem from './TodoItem'

// Use memo to prevent unnecessary re-renders when props don't change
export default memo(function TodoList({ todos = [], onToggle, onDelete, actionLabel, toggleLabel = "Complete", isLoading }) {
    // Ensure todos is always an array even if null/undefined is passed
    const safeItems = Array.isArray(todos) ? todos : [];
    const [renderTodos, setRenderTodos] = useState(safeItems);

    // Memoize handler functions to prevent unnecessary re-renders
    // IMPORTANT: These must be defined before any conditional returns
    const handleToggle = useCallback((todo) => {
        onToggle(todo);
    }, [onToggle]);

    const handleDelete = useCallback((todo) => {
        onDelete(todo);
    }, [onDelete]);

    // Always sync renderTodos to latest todos prop
    useEffect(() => {
        // Ensure we're always working with an array
        const safeTodos = Array.isArray(todos) ? todos : [];
        setRenderTodos(safeTodos);
    }, [todos]);

    // Render empty state - all hooks are called before any conditional returns
    if (!renderTodos || renderTodos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400 animate-fadeIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg font-medium">No tasks found</p>
                <p className="text-sm">Add some tasks to get started</p>
            </div>
        )
    }

    return (
        <div className={`mt-4 space-y-2 relative ${isLoading ? 'opacity-70' : ''}`}>
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-20 dark:bg-black dark:bg-opacity-10 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                </div>
            )}

            {/* Virtualized rendering for better performance with many items */}
            {renderTodos.slice(0, 20).map((todo, index) => (
                <div
                    key={todo.id}
                    className="animate-fadeIn transform transition-all duration-200 ease-out"
                    style={{
                        animationDelay: `${Math.min(index * 50, 500)}ms`,
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    <TodoItem
                        todo={todo}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        actionLabel={actionLabel}
                        toggleLabel={toggleLabel}
                    />
                </div>
            ))}

            {/* Show count if more than 20 items */}
            {renderTodos.length > 20 && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                    ...and {renderTodos.length - 20} more items
                </div>
            )}    </div>
    )
});
