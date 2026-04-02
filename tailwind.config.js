/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f2f6f2',
          100: '#e0eae1',
          200: '#c2d6c4',
          300: '#97ba9b',
          400: '#6a9b70',
          500: '#4a7d51',
          600: '#3a6341',
          700: '#2e4f34',
          800: '#253f2b',
          900: '#1a2e1d',
        },
        sage: {
          50:  '#fafaf8',
          100: '#f2f4f0',
          200: '#e5e8e3',
          300: '#cdd2cb',
          400: '#a8b0a5',
          500: '#828c7e',
          600: '#636b60',
          700: '#4a524a',
          800: '#333a33',
          900: '#1e241e',
        },
        warm: {
          50:  '#fefefe',
          100: '#fdf8f0',
          200: '#faf3e6',
          300: '#f5ecdb',
          400: '#eee0cc',
          500: '#e4cfb5',
        },
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
