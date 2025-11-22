/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          'from': {
            opacity: '0',
            maxHeight: '0',
          },
          'to': {
            opacity: '1',
            maxHeight: '500px',
          },
        },
        swipeLeft: {
          '0%, 100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
          '50%': {
            transform: 'translateX(-20px)',
            opacity: '0.5',
          },
        },
        swipeRight: {
          '0%, 100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
          '50%': {
            transform: 'translateX(20px)',
            opacity: '0.5',
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
        swipeLeft: 'swipeLeft 1.5s ease-in-out infinite',
        swipeRight: 'swipeRight 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}