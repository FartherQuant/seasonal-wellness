/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
      },
    },
    extend: {
      colors: {
        // Design tokens — 顺时生活视觉系统
        ink: {
          deep: "#1A1F2E",
          soft: "#2F4554",
          50: "#f7f8fa",
          100: "#e8ebf1",
          200: "#c9d2e0",
          300: "#9aaaBF",
          400: "#7A8CA8",
          500: "#5A6A82",
          600: "#4A5A72",
          700: "#3A4A62",
          800: "#2A3A52",
          900: "#1A2A42",
        },
        bone: {
          DEFAULT: "#F5F0E6",
          soft: "#C8C0B0",
          muted: "#A8A090",
        },
        gold: "#D4A843",
        spring: {
          DEFAULT: "#4A7C59",
          light: "#6A9C79",
          dark: "#2A5C39",
        },
        summer: {
          DEFAULT: "#C4553E",
          light: "#E4755E",
          dark: "#A4352E",
        },
        autumn: {
          DEFAULT: "#B8860B",
          light: "#D8A62B",
          dark: "#986600",
        },
        winter: {
          DEFAULT: "#4A6FA5",
          light: "#6A8FC5",
          dark: "#2A4F85",
        },
      },
      fontFamily: {
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        display: "0.02em",
        wide: "0.04em",
        wider: "0.08em",
        widest: "0.12em",
        mono: "0.02em",
      },
    },
  },
  plugins: [],
};
