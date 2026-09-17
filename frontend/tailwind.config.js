/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          50: '#fdf2f6',
          100: '#fce7ef',
          500: '#a8324f',
          600: '#8d2440',
          700: '#722036',
          900: '#4a1424',
        },
      },
    },
  },
  plugins: [],
}
