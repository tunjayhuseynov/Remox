module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  mode: 'jit',
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#FF7348",
        greyful: "#707070"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
