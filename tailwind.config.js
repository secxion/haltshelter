const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // primary used throughout the app (e.g. primary-600)
        primary: colors.indigo,
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Poppins', 'Segoe UI', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        // Default breakpoints remain: sm:640, md:768, lg:1024, xl:1280, 2xl:1536
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        'screen-nav': 'calc(100vh - 64px)', // Account for navbar
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp')
  ],
}
