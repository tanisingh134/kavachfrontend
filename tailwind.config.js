/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        safety: {
          dark: '#12061c',
          navy: '#1a0b2e',
          card: '#2a1248',
          border: '#6b21a8',
          accent: '#FACC15',
          primary: '#FACC15',
          amber: '#FACC15',
          amberGlow: '#FDE047',
          violet: '#7C3AED',
          teal: '#FACC15',
          emerald: '#FACC15',
          rose: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      }
    },
  },
  plugins: [],
}
