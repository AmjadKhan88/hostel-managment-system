/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces (see docs/DESIGN_TOKENS.md for source reasoning)
        canvas: '#F4F6FB', // page background behind cards
        surface: '#FFFFFF', // card / sidebar / topbar background
        border: {
          DEFAULT: '#EBEDF3',
          strong: '#E1E4EC',
        },
        ink: {
          DEFAULT: '#111827', // primary text
          muted: '#6B7280', // secondary text
          subtle: '#9AA1B1', // placeholders, faint labels
        },
        brand: {
          50: '#EEF3FF',
          100: '#DEE9FF',
          200: '#BBD2FF',
          300: '#8FB3FF',
          400: '#5C8DFB',
          500: '#2F6FED', // primary action color
          600: '#1E56D6',
          700: '#1943AC',
          800: '#173A8A',
          900: '#152F66',
        },
        success: {
          DEFAULT: '#12A150',
          bg: '#E4F8EC',
        },
        danger: {
          DEFAULT: '#F0416C',
          bg: '#FDE7ED',
        },
        warning: {
          DEFAULT: '#F5A524',
          bg: '#FDF3E1',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '20px',
        control: '12px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 12px 24px -12px rgba(16, 24, 40, 0.08)',
        popover: '0 8px 24px -6px rgba(16, 24, 40, 0.16)',
      },
      spacing: {
        18: '4.5rem',
        sidebar: '260px',
        'sidebar-collapsed': '84px',
      },
    },
  },
  plugins: [],
};
