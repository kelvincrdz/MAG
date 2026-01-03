/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d8263e',
        primaryHover: '#b01e32',
        primaryLight: '#ff4d66',
        secondary: '#03182b',
        secondaryHover: '#051e33',
        secondaryLight: '#0a2540',
        background: '#0a0e17',
        surface: '#1a1f2e',
        surfaceHover: '#242938',
        text: '#f8f9fa',
        textMuted: '#94a3b8',
        textDim: '#64748b',
        border: '#334155',
        borderHover: '#475569',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(216, 38, 62, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(216, 38, 62, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
