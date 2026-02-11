/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0d9488",
        },
        secondary: {
          DEFAULT: "#f97316",
        },
        "accent-orange": "#fb923c",
        "background-light": "#f5fbf9",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
