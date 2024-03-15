/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      minHeight: {
        80: '20rem' // This value may need adjustment based on your design
      }
    }
  },
  plugins: []
}
