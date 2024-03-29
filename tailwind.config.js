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
      'sans': ['Inter', 'system-ui'],
      'nunito': ['Nunito', 'sans-serif']

    },
    extend: {
      fontSize: {
        'xxs': '.625rem',
        'xs': '.75rem',
        'sm': '.875rem',
        'tiny': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        '4xl': '1.875rem',
        '5xl': '2rem',
        '6xl': '2.125rem',
      },
      colors: {
        primary: "#FF7348",
        secondary: "#f94f1b",
        greylish: "#707070",
        grey: "#C4C4C4",
        grayHot: "#dad8d8",
        darkSecond: "#1C1C1C",
        dark: '#252525',
        light: '#f9f9f9',
        tabelBarLight: "#F2F2F2"
      },
      boxShadow: {
        custom: "0px 0px 4px 0px #dad8d8",
        customDark: "0px 0px 4px 0px #1C1C1C",
        navbarShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)"
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
