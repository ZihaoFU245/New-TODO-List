import React, { useState, memo, useCallback } from 'react'

const TodoInput = memo(function TodoInput({ onAdd }) {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
      <div className="flex shadow-sm rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-opacity-50">
        <input
          type="text"
          placeholder="Add a new task..."          className="flex-grow p-3 border-none focus:outline-none"
          value={text}
          onChange={handleTextChange}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium 
                     transition-all duration-200 focus:outline-none
                     ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-indigo-500 hover:to-indigo-600'}`}
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
