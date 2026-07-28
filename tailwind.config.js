/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,vue}'],
  // Keep class-based dark mode for the whole app. Light preview islands in
  // storybook use .theme-preview-light so dark: utilities skip them when html.dark.
  darkMode: ['variant', '.dark &:not(.theme-preview-light *)'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        surface: {
          light: '#ffffff',
          dark: '#070b09',
          950: '#070b09',
          900: '#0c1210',
          800: '#131b17',
          700: '#1a2420',
          600: '#24302b',
          500: '#3a4741',
          400: '#55635c',
        },
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'modal-enter': 'modalEnter 0.2s ease-out',
        'modal-backdrop': 'modalBackdrop 0.2s ease-out',
        'drawer-enter-right': 'drawerEnterRight 0.25s ease-out',
        'drawer-enter-left': 'drawerEnterLeft 0.25s ease-out',
        'drawer-backdrop': 'drawerBackdrop 0.25s ease-out',
        'chart-fade-in': 'chartFadeIn 0.8s ease-out forwards',
        'chart-dot-pop': 'chartDotPop 0.4s ease-out forwards',
        'chart-bar-grow': 'chartBarGrow 0.8s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        chartFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        chartDotPop: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        chartBarGrow: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        modalEnter: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        modalBackdrop: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        drawerEnterRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        drawerEnterLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        drawerBackdrop: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
