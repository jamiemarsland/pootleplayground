/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'blueprint': {
          50: '#f0f6fc',
          100: '#c2dfff',
          200: '#94c5ff',
          300: '#66aaff',
          400: '#388fff',
          500: '#2271b1',
          600: '#135e96',
          700: '#072a52',
          800: '#f6f7f7',
          900: '#dcdcde',
          950: '#c3c4c7',
          paper: '#ffffff',
          grid: '#f0f0f1',
          text: '#1e1e1e',
          accent: '#2271b1',
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
