/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'blueprint': {
          50: '#f0f7ff',
          100: '#c2e3ff',
          200: '#94cfff',
          300: '#66bbff',
          400: '#38a7ff',
          500: '#0a93ff',
          600: '#0074cc',
          700: '#005599',
          800: '#003d73',
          900: '#002447',
          950: '#001a35',
          paper: '#1e3a5f',
          grid: '#2a4d73',
          text: '#e6f3ff',
          accent: '#4fc3f7'
        },
        'pootle-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3858e9',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
};
