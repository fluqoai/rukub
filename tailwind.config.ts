import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // لوحة الساچي المتفق عليها
        sage: {
          50:  '#F4F6F1',
          100: '#E5EBDB',
          200: '#C9D5B5',
          300: '#A8B88A',
          400: '#8A9D67',
          500: '#6B7A5A', // primary
          600: '#566347',
          700: '#444E39',
          800: '#363D2E',
          900: '#2A2F25',
        },
        linen: {
          50:  '#FBF9F5',
          100: '#F5F1EA', // background
          200: '#E8E1D2',
          300: '#D5CBB6',
        },
        wood: {
          400: '#C9A87C',
          500: '#B8956A', // accent
          600: '#9A7A52',
          700: '#7A5F3F',
        },
        ink: {
          900: '#2C2A26', // primary text
          700: '#4A4742',
          500: '#7A766E',
          300: '#A8A296', // muted
        },
      },
      fontFamily: {
        sans: ['var(--font-arabic)', 'system-ui', 'sans-serif'],
        display: ['var(--font-arabic)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 5vw + 1rem, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 3.5vw + 1rem, 3.25rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(44 42 38 / 0.04), 0 4px 12px -2px rgb(44 42 38 / 0.06)',
        card: '0 2px 4px -1px rgb(44 42 38 / 0.04), 0 12px 24px -4px rgb(44 42 38 / 0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
