import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };

    const [currentTheme, setCurrentTheme] = useState(() => {
        // Check for saved theme preference or system preference
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') || '';
            // Just check if dark mode is enabled
            const isDark = savedTheme && document.documentElement.classList.contains('dark');
            return isDark ? THEMES.DARK : THEMES.LIGHT;
        }
        return THEMES.LIGHT;
    });

    useEffect(() => {
        // Update dark mode class on document when theme changes
        const root = document.documentElement;
        
        // Toggle dark mode class
        if (currentTheme === THEMES.DARK) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        // Listen for theme changes from the ThemeSelector
        const handleThemeChange = () => {
            // Just check if dark mode is still applied
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark !== (currentTheme === THEMES.DARK)) {
                setCurrentTheme(isDark ? THEMES.DARK : THEMES.LIGHT);
            }
        };
        
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                handleThemeChange();
            }
        });
        
        // Don't change the theme name here, just toggle dark mode
        // The ThemeSelector component will handle the actual theme
    }, [currentTheme, THEMES]);

    const toggleDarkMode = () => {
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        setCurrentTheme(newTheme);
        
        // Toggle the dark class on the document root
        if (newTheme === THEMES.DARK) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Trigger an event to notify other components
        const event = new Event('darkmodechange');
        window.dispatchEvent(event);
    };

    return (
        <button
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className={`p-2 rounded-full focus:outline-none focus:ring-2 transition-colors duration-200 ${
                currentTheme === THEMES.DARK
                    ? 'bg-gray-700 text-white focus:ring-violet-500'
                    : 'bg-gray-200 text-gray-800 focus:ring-indigo-500'
                } hover:shadow-md`}
            title="Toggle dark mode"
        >
            {currentTheme === THEMES.DARK ? (
                // Sun icon for switching to light mode
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
            ) : (
                // Moon icon for switching to dark mode
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            )}
        </button>
    );
}
