// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a3a5c",   // premium law firm navy
        accent: "#c9a84c",    // premium gold
        background: "#0f1923", // deep premium dark
        surface: "#172733",   // card surface
        text: "#ffffff",      // white text
        border: "#243c4f",    // premium dark gold/gray border
        muted: "#8fa3b5",     // premium muted slate
      },
    },
  },
  plugins: [],
}
