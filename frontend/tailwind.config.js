/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        utec: {
          blue: {
            DEFAULT: '#00BFFF',
            dark: '#039',
            light: '#BFF0FF'
          },
          text: {
            DEFAULT: '#231F20',
            gray: '#5F6480',
            light: '#CADAEF'
          },
          bg: {
            DEFAULT: '#F3F8FF'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
