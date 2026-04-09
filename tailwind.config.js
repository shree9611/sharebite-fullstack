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
        "background-light": "#FFD8A8",
        surface: "#FFFFFF",
        "surface-alt": "#F8FAFC",
        border: "#E2E8F0",
        "text-main": "#0F172A",
        "text-muted": "#475569",
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
