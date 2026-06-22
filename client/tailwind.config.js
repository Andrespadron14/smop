/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          150: '#efefef',
          200: '#e5e5e5',
          250: '#dddddd',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          650: '#444444',
          700: '#404040',
          750: '#343434',
          800: '#262626',
          850: '#1f1f1f',
          900: '#171717',
          950: '#0d0d0d',
        }
      }
    },
  },
  plugins: [],
};
