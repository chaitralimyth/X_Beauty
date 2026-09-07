/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ivory: '#FAF7F2',
        cream: '#F5EFE6',
        charcoal: '#1A1714',
        accent: {
          50: '#F7F3EE',
          100: '#EDE4D8',
          200: '#D9C7B0',
          300: '#C4A983',
          400: '#B0895C',
          500: '#9A7B4F',
          600: '#856842',
          700: '#6F5636',
          800: '#5A452C',
          900: '#443420',
        },
        neutral: {
          50: '#FAF9F7',
          100: '#F5F3F0',
          200: '#E8E4DE',
          300: '#D4CFC6',
          400: '#B0A99D',
          500: '#8C8478',
          600: '#6F6759',
          700: '#524C42',
          800: '#2E2A25',
          900: '#1A1714',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.7s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
