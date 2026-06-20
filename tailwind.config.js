/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cosmic: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4ff',
          300: '#9999ff',
          400: '#6666ff',
          500: '#4a4aff',
          600: '#3333cc',
          700: '#2a2a99',
          800: '#1a1a66',
          900: '#1a1a3e',
          950: '#0f0f25',
        },
        bronze: {
          50: '#fef9e7',
          100: '#fcf0c8',
          200: '#f8de8f',
          300: '#f3c655',
          400: '#eeb02d',
          500: '#c9a227',
          600: '#a8821e',
          700: '#875f1a',
          800: '#6b4a1b',
          900: '#5a3e1c',
        },
        rune: {
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
        mystic: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#7c3aed',
          700: '#6b21a8',
          800: '#581c87',
          900: '#4a1a6b',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['"Source Serif Pro"', 'serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(201, 162, 39, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(201, 162, 39, 0.8), 0 0 30px rgba(201, 162, 39, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'stone-texture': "linear-gradient(135deg, #374151 0%, #1f2937 50%, #374151 100%)",
        'star-field': "radial-gradient(ellipse at center, #1a1a3e 0%, #0f0f25 100%)",
      },
    },
  },
  plugins: [],
};
