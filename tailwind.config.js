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

      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',

      },
    },
  },
  plugins: [],
}