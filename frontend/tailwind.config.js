/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#042245",
        card: "#0A315C",
        accent: "#76D5FF",
        warning: "#F8B95A",
        critical: "#FF5F6D",
        textPrimary: "#E9F7FF",
        textSecondary: "#B8D8EC",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        panel: "0 18px 42px rgba(2, 32, 68, 0.4)",
        elevate: "0 24px 48px rgba(1, 28, 56, 0.6)",
      },
    },
  },
  plugins: [],
};
