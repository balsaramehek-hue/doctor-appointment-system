/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec0ff',
          400: '#599cff',
          500: '#3377ff',
          600: '#1f57f5',
          700: '#1843e1',
          800: '#1a38b6',
          900: '#1b338f',
        },
        accent: {
          50: '#eafaf6',
          100: '#cdf2e8',
          200: '#a0e6d4',
          300: '#67d3ba',
          400: '#33b89c',
          500: '#16a085',
          600: '#10816b',
          700: '#0f6657',
          800: '#105249',
          900: '#0e443d',
        },
        dark: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(16, 24, 40, 0.12)',
        'card-hover': '0 20px 40px -12px rgba(16, 24, 40, 0.18)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
