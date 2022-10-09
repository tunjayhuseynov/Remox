module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./subpages/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['Inter', 'system-ui']

    },
    extend: {
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
        'tiny': '.875rem',
        'base': '1rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
      },
      colors: {
        primary: "#FF7348",
        secondary: "#f94f1b",
        greylish: "#707070",
        darkSecond: "#1C1C1C",
        dark: '#252525',
        light: '#f9f9f9'
      },
      boxShadow: {
        custom: "0px 2px 7px 0px #dad8d8",
        customDark: "0px 2px 7px 0px #1C1C1C"
      },
      screens: {
        '3xl': '1920px',
      }
    },
  },
  plugins: [
      require('tailwind-scrollbar'),  
  ],
}
