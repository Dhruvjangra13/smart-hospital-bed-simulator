/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinical: {
          dark: '#0B0F19',
          card: '#111827',
          cardHover: '#1F2937',
          border: '#374151',
          accent: '#06B6D4',
          low: '#10B981',
          lowMed: '#F59E0B',
          medium: '#F97316',
          high: '#EF4444',
          critical: '#DC2626'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
