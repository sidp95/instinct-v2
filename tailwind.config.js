/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        comic: ['"Comic Neue"', 'cursive', 'sans-serif'],
      },
      colors: {
        comic: {
          bg: '#E8E8E8',
          paper: '#F5F5F5',
          border: '#222222',
          yes: '#4ADE80',
          no: '#F87171',
          accent: '#60A5FA',
        }
      },
      borderRadius: {
        comic: '14px',
      },
      boxShadow: {
        comic: '4px 4px 0px #222222',
        'comic-sm': '2px 2px 0px #222222',
        'comic-lg': '6px 6px 0px #222222',
      }
    },
  },
  plugins: [],
}
