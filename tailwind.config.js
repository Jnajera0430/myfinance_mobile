/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"], // Ajusta la ruta si tu código está en /src
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}