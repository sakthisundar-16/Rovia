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
        ink: '#000000',
        mist: '#D1D0D0',
        mauve: {
          DEFAULT: '#988686',
          hover: '#827171',
          light: '#B5A8A8',
        },
        plum: {
          DEFAULT: '#5C4E4E',
          dark: '#3D3333',
          light: '#7A6B6B',
        },
        semantic: {
          success: '#5E7A63',
          warning: '#B08A4E',
          danger: '#A0524E',
          info: '#5E7286',
        }
      },
      fontFamily: {
        serif: ['"Elegant Bloom"', 'Fraunces', 'Playfair Display', 'serif'],
        sans: ['Inter', 'General Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(92, 78, 78, 0.08)',
        'warm-md': '0 8px 24px rgba(92, 78, 78, 0.12)',
        'warm-lg': '0 16px 40px rgba(92, 78, 78, 0.18)',
        'glass-light': '0 8px 32px 0 rgba(92, 78, 78, 0.10)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
