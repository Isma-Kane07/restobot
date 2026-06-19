/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#FF6B00',
        'brand-dark': '#E55D00',
        'brand-light': '#FFF0E5',
        whatsapp: '#16A34A',
        dark: '#0F172A',
        'dark-card': '#1E293B',
        'dark-border': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}