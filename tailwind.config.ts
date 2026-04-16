import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },

      colors: {
        // 🔥 Brand Colors
        primary: {
          DEFAULT: "#323232", // Slate
          light: "#6B6B6B",
          dark: "#1F1F1F",
        },

        secondary: {
          DEFAULT: "#868D78", // Moss
          light: "#A3A995",
          dark: "#5F6554",
        },

        accent: {
          DEFAULT: "#A89F85", // Clay
        },

        neutral: {
          DEFAULT: "#CDCEC1", // Stone
        },

        // optional semantic
        background: "#CDCEC1",
        foreground: "#323232",
      },
    },
  },
  plugins: [],
};

export default config;