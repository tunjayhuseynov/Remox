module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#FF7348",
        greylish: "#707070",
        darkSecond: "#1C1C1C",
        dark: '#252525',
        light: '#f9f9f9'
      },
      boxShadow: {
        custom: "0px 2px 7px 0px #dad8d8"
      }
    },
  },
  variants: {
    extend: {
    },
  },
  plugins: [],
}
