/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6366f1',
        'secondary': '#ec4899',
        'accent': '#f59e0b',
        'background-dark': '#1f2937',
        'background-light': '#374151',
        'border-color': '#4b5563',
        'text-primary': '#f9fafb',
        'text-secondary': '#d1d5db',
      },
      boxShadow: {
        'custom': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
