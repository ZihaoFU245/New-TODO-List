module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        'pencil-strike': 'pencil-draw 0.6s ease-in-out forwards',
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
