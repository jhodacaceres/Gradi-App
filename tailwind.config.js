/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#6D28D9',
        'brand-indigo': '#4F46E5',
        'brand-light': '#F3F4F6',
        'brand-white': '#FFFFFF',
        'brand-text-primary': '#1F2937',
        'brand-text-secondary': '#6B7280',
      },
      borderRadius: {
        'xl': '1rem',
      }
    },
  },
  plugins: [],
}
