import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#09090b",
        surface: "#111113",
        elevated: "#19191d",
        "t-1": "#eceef3",
        "t-2": "#a0a8b8",
        "t-3": "#5c6478",
        "t-4": "#333a4a",
        sealed: "#3b7cf5",
        "sealed-dim": "#1a3570",
        revealed: "#10b981",
        "revealed-dim": "#064e3b",
        warn: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderColor: {
        DEFAULT: "rgba(255, 255, 255, 0.06)",
        strong: "rgba(255, 255, 255, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
