import React, { useEffect, useState } from 'react';

// Define all available themes (moved outside the component)
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    NATURE: 'nature',
    PURPLE: 'purple',
    OCEAN: 'ocean',
    SUNSET: 'sunset'
};

// Map of themes to their display names (moved outside the component)
const THEME_NAMES = {
    [THEMES.LIGHT]: 'Light',
    [THEMES.DARK]: 'Dark',
    [THEMES.NATURE]: 'Nature',
    [THEMES.PURPLE]: 'Purple',
    [THEMES.OCEAN]: 'Ocean',
    [THEMES.SUNSET]: 'Sunset'
};

// The ThemeSelector component allows users to choose from multiple themes
const ThemeSelector = () => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        // Check for saved theme preference
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || THEMES.LIGHT;
        }
        return THEMES.LIGHT;
    });
    
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => {
        // Update classes on document when theme changes
        const root = document.documentElement;

        // First, get the current dark mode state
        const isDarkMode = root.classList.contains('dark');
        
        // Remove all theme-specific classes
        root.classList.remove('light-theme', 'dark-theme', 'nature-theme', 'purple-theme', 'ocean-theme', 'sunset-theme');
        
        // Apply the theme-specific class
        if (currentTheme === THEMES.NATURE) {
            root.classList.add('nature-theme');
        } else if (currentTheme === THEMES.PURPLE) {
            root.classList.add('purple-theme');
        } else if (currentTheme === THEMES.OCEAN) {
            root.classList.add('ocean-theme');
        } else if (currentTheme === THEMES.SUNSET) {
            root.classList.add('sunset-theme');
        } else if (currentTheme === THEMES.DARK) {
            root.classList.add('dark-theme');
        } else {
            root.classList.add('light-theme');
        }
        
        // Respect the overall dark mode setting
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            // If overall dark mode is off, ensure the 'dark' class is removed 
            // unless the selected theme itself is the DARK theme.
            if (currentTheme !== THEMES.DARK) {
                 root.classList.remove('dark');
            }
        }
        
        // Save theme to localStorage for persistence
        localStorage.setItem('theme', currentTheme);
        
        // Close the dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (!e.target.closest('.theme-selector')) {
                setIsOpen(false);
            }
        };
        
        // Listen for dark mode changes from ThemeToggle (or other sources)
        const handleDarkModeChange = () => {
            // Re-evaluate theme application when dark mode changes externally
            // This ensures consistency if dark mode is toggled elsewhere
            setCurrentTheme(localStorage.getItem('theme') || THEMES.LIGHT);
        };
        
        window.addEventListener('darkmodechange', handleDarkModeChange);
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('darkmodechange', handleDarkModeChange);
        };
    }, [currentTheme, isOpen]); // THEMES is removed from dependency array as it's module-scope

    const handleThemeChange = (theme) => {
        setCurrentTheme(theme);
        setIsOpen(false);
    };

    return (
        <div className="theme-selector relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 transition-colors duration-200 
                    ${currentTheme === THEMES.NATURE
                        ? 'bg-nature-100 text-nature-800 focus:ring-nature-500 hover:bg-nature-200'
                        : currentTheme === THEMES.DARK
                            ? 'bg-gray-700 text-white focus:ring-violet-500 hover:bg-gray-600'
                            : currentTheme === THEMES.PURPLE
                                ? 'bg-purple-100 text-purple-800 focus:ring-purple-500 hover:bg-purple-200'
                                : currentTheme === THEMES.OCEAN
                                    ? 'bg-blue-100 text-blue-800 focus:ring-blue-500 hover:bg-blue-200'
                                    : currentTheme === THEMES.SUNSET
                                        ? 'bg-orange-100 text-orange-800 focus:ring-orange-500 hover:bg-orange-200'
                                        : 'bg-gray-100 text-gray-800 focus:ring-indigo-500 hover:bg-gray-200'
                    }`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span>Theme: {THEME_NAMES[currentTheme]}</span>
                <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {Object.values(THEMES).map(theme => (
                            <button
                                key={theme}
                                onClick={() => handleThemeChange(theme)}
                                className={`block w-full text-left px-4 py-2 text-sm ${
                                    currentTheme === theme
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                role="menuitem"
                            >
                                {THEME_NAMES[theme]}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Export the ThemeSelector component
export default ThemeSelector;
