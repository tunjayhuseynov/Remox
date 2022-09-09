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
        'sm': '.85714rem',
        'tiny': '.875rem',
        'base': '1rem',
        'lg': '1rem',
        'xl': '1.42857rem',
        '2xl': '1.714285rem',
        '3xl': '2rem',
      },
      colors: {
        primary: "#FF7348",
        greylish: "#707070",
        darkSecond: "#1C1C1C",
        dark: '#252525',
        light: '#f9f9f9'
      },
      boxShadow: {
        custom: "0px 2px 7px 0px #dad8d8",
        customDark: "0px 2px 7px 0px #1C1C1C"
      }
    },
  },
  plugins: [
      require('tailwind-scrollbar'),  
  ],
}
