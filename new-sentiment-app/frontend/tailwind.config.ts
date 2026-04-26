import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow":   "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":    "spin 3s linear infinite",
        "bounce-light": "bounce 2s infinite",
        "neon-breath":  "neon-breath 2s ease-in-out infinite",
      },
      keyframes: {
        "neon-breath": {
          "0%, 100%": { boxShadow: "0 0 6px 1px rgba(139,92,246,0.3)" },
          "50%":       { boxShadow: "0 0 18px 4px rgba(139,92,246,0.6)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "glow-violet": "0 0 20px rgba(139, 92, 246, 0.4)",
        "glow-indigo": "0 0 20px rgba(99, 102, 241, 0.4)",
        "inner-white": "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;