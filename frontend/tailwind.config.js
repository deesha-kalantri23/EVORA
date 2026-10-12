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
        charcoal: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#b0baca',
          400: '#8393ac',
          500: '#637391',
          600: '#4e5b77',
          700: '#3f4961',
          800: '#363d50',
          900: '#14171f',
          950: '#0c0e14',
        },
        evora: {
          green: '#00D26A',
          greenLight: '#10E599',
          greenDark: '#059669',
          charcoal: '#0F172A',
          charcoalLight: '#1E293B',
          charcoalBorder: '#334155',
          surface: '#1E293B',
          bg: '#0B0F17',
          card: '#131B2B',
          cardLight: '#FFFFFF',
          textMuted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glow-green': '0 0 15px -3px rgba(0, 210, 106, 0.25)',
      }
    },
  },
  plugins: [],
}
