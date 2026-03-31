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
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f3c6fe',
          300: '#e993fd',
          400: '#d855f7',
          500: '#bf2de8',
          600: '#a21ac6',
          700: '#8515a1',
          800: '#6e1484',
          900: '#5c136c',
        },
        sage: {
          50:  '#f4f7f4',
          100: '#e2ebe2',
          200: '#c4d7c6',
          300: '#9bbca0',
          400: '#6d9b74',
          500: '#4d7d55',
          600: '#3a6341',
          700: '#304f36',
          800: '#29412d',
          900: '#233626',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
