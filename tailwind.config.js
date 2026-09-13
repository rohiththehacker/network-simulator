/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#0f1629',
          card: '#111827',
          elevated: '#1a2235',
        },
        border: {
          DEFAULT: '#1e2d45',
          bright: '#2a3f5f',
        },
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.2)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.2)',
        card: '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'stack-push': 'stackPush 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'stack-pop': 'stackPop 0.3s ease-in forwards',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        stackPush: {
          '0%': { transform: 'translateY(-20px) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        stackPop: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-20px) scale(0.95)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
