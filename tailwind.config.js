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
          DEFAULT: "#FF8A00",
          dark: "#E07600",
          soft: "#FFF3E0",
        },
        secondary: {
          DEFAULT: "#16A34A",
          soft: "#F0FDF4",
        },
        "accent-orange": "#FF8A00",
        "background-light": "#FFF3E0",
        surface: "#FFFFFF",
        "surface-alt": "#FFFAF2",
        border: "#F2D4B2",
        "text-main": "#2B1B0E",
        "text-muted": "#6B4E3D",
        success: "#16A34A",
        warning: "#CA8A04",
        danger: "#DC2626",
        info: "#2563EB",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
