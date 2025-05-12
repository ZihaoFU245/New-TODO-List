import React, { useState, memo, useCallback, useEffect } from 'react'
import { animateButtonPress } from '../utils/animations'

const TodoInput = memo(function TodoInput({ onAdd }) {
    const [text, setText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [currentTheme, setCurrentTheme] = useState('light')

    // Track theme changes
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setCurrentTheme(savedTheme);

        const handleStorageChange = (e) => {
            if (e.key === 'theme') {
                setCurrentTheme(e.newValue || 'light');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Use useCallback to prevent unnecessary re-renders
    const handleTextChange = useCallback((e) => {
        setText(e.target.value);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        if (text.trim()) {
            setIsLoading(true)
            try {
                await onAdd(text)
                setText('')
            } finally {
                setIsLoading(false)
            }
        }
    }, [text, onAdd]);

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <div className={`flex shadow-sm rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-opacity-50
        ${currentTheme === 'nature'
                    ? 'focus-within:ring-nature-500'
                    : 'focus-within:ring-indigo-500'}`}>
                <input
                    type="text"
                    placeholder="Add a new task..."
                    className={`flex-grow p-3 border-none focus:outline-none
            ${currentTheme === 'nature'
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-white dark:bg-gray-700'}`}
                    value={text}
                    onChange={handleTextChange}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !text.trim()}
                    onClick={(e) => {
                        if (!isLoading && text.trim() && e.currentTarget) {
                            animateButtonPress(e.currentTarget);
                        }
                    }}
                    className={`px-6 py-3 text-white font-medium transition-all duration-200 focus:outline-none
            ${currentTheme === 'nature'
                            ? `bg-gradient-to-r from-nature-600 to-nature-700
                 ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-nature-500 hover:to-nature-600'}`
                            : `bg-gradient-to-r from-indigo-600 to-indigo-700
                 ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-indigo-500 hover:to-indigo-600'}`
                        }`}
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                        </span>
                    ) : 'Add Task'}
                </button>
            </div>    </form>
    )
});

export default TodoInput;
