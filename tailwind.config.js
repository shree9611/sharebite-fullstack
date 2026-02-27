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
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          soft: "#EFF6FF",
        },
        secondary: {
          DEFAULT: "#16A34A",
          soft: "#F0FDF4",
        },
        "accent-orange": "#2563EB",
        "background-light": "#FFFFFF",
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
