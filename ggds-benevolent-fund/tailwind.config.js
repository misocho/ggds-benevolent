/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#0ec434',
          600: '#0ca82c',
          700: '#0b8b24',
          800: '#0a6e1c',
          900: '#095818',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#273171',
          800: '#1e2650',
          900: '#0f172a',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#0ec434',
          600: '#0ca82c',
          700: '#0b8b24',
          800: '#0a6e1c',
          900: '#095818',
        }
      },
      fontFamily: {
        sans: ['Open Sans', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}