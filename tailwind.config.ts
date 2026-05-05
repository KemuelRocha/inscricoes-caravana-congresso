import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        roxo: {
          950: '#0f0520',
          900: '#1e0a3c',
          800: '#2d1057',
          700: '#4C1D95',
          600: '#6D28D9',
          500: '#7C3AED',
          400: '#8B5CF6',
          300: '#A78BFA',
        },
        dourado: {
          700: '#B45309',
          600: '#D97706',
          500: '#F59E0B',
          400: '#FBBF24',
          300: '#FCD34D',
        },
      },
      fontFamily: {
        display: ['var(--font-montserrat)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245,158,11,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(245,158,11,0.7), 0 0 60px rgba(245,158,11,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'count-appear': {
          from: { opacity: '0', transform: 'scale(0.6) translateY(15px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'bar-fill': {
          from: { width: '0%' },
          to: { width: 'var(--bar-width)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'count-appear': 'count-appear 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        shimmer: 'shimmer 2.5s linear infinite',
        'bar-fill': 'bar-fill 1.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
