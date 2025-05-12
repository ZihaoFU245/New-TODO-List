module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./public/**/*.html"],
    darkMode: 'class',
    theme: {
        extend: {
            animation: {
                fadeIn: 'fadeIn 0.3s ease-in-out',
                'pencil-strike': 'pencil-draw 0.6s ease-in-out forwards',
                float: 'float 3s ease-in-out infinite',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                'pencil-draw': {
                    '0%': {
                        strokeDashoffset: '100',
                        strokeWidth: '2px',
                    },
                    '30%': {
                        strokeDashoffset: '100',
                        strokeWidth: '3px',
                    },
                    '100%': {
                        strokeDashoffset: '0',
                        strokeWidth: '2px',
                    },
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-1px)' },
                    '75%': { transform: 'translateX(1px)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'pulse': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                }
            },
            colors: {
                // Custom color palette
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                // Nature theme colors
                nature: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                // Purple theme colors
                purple: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
                // Ocean theme colors
                ocean: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                // Sunset theme colors
                sunset: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
            },
            transitionProperty: {
                'width': 'width',
                'height': 'height',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
