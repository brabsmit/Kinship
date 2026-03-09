/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent:    { DEFAULT: '#E67E22' },
        ink:       { DEFAULT: '#3e3221' },
        navy:      { DEFAULT: '#2C3E50', light: '#34495E' },
        gold:      { light: '#FFF8E1', pale: '#FFECB3', DEFAULT: '#F59E0B', dark: '#B45309', darker: '#78350F' },
        parchment: { light: '#fdfbf7', DEFAULT: '#F9F5F0', warm: '#f4e4bc', tan: '#eaddcf', cool: '#eef2f5', muted: '#FAFAF9' },
        maternal:  { DEFAULT: '#831843' },
      },
    },
  },
  plugins: [],
}