/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        mono: ['Menlo', 'Courier New', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FBF8F3',
          100: '#F4EFE6',
          200: '#E8E1D3',
        },
        ink: {
          50: '#F7F5F1',
          100: '#ECE8E1',
          200: '#D4CFC4',
          300: '#A8A296',
          400: '#7A7468',
          500: '#544F46',
          600: '#383530',
          700: '#22201D',
          800: '#141312',
          900: '#0A0A0B',
        },
        accent: {
          DEFAULT: '#6D4BFF',
          soft: '#A98EFF',
          deep: '#3A22A8',
          ink: '#0F0930',
        },
        warm: '#FF8A5C',
        leaf: '#3DD68C',
        sky: '#4FB6FF',
        rose: '#FF6B8A',
        amber: '#F5B544',
        ember: '#E5532E',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      fontSize: {
        '2xs': '10px',
      },
    },
  },
  plugins: [],
};
