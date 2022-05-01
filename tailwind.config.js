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
  plugins: [],
}
