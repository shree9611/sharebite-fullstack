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
          DEFAULT: "#2F9F6A",
          dark: "#248C5A",
          soft: "#EAF7F0",
        },
        secondary: {
          DEFAULT: "#F59E0B",
          soft: "#FFF4DE",
        },
        "accent-orange": "#F59E0B",
        "background-light": "#F8F6F1",
        surface: "#FFFFFF",
        "surface-alt": "#FFFDF8",
        border: "#E8E0CF",
        "text-main": "#1F1B13",
        "text-muted": "#6E685C",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#2563EB",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
