import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        "deep-space": "#0B1426",
        "electric-blue": "#2563EB",
        "bright-cyan": "#06B6D4",
        "pure-white": "#FFFFFF",

        // Accent Colors
        "success-green": "#10B981",
        "warning-amber": "#F59E0B",
        "error-red": "#EF4444",

        // Market-Specific Colors
        "prediction-green": "#22C55E",
        "prediction-red": "#EF4444",
        "neutral-purple": "#8B5CF6",

        // Neutral Gray Scale
        "gray-50": "#F8FAFC",
        "gray-100": "#F1F5F9",
        "gray-200": "#E2E8F0",
        "gray-300": "#CBD5E1",
        "gray-400": "#94A3B8",
        "gray-500": "#64748B",
        "gray-600": "#475569",
        "gray-700": "#334155",
        "gray-800": "#1E293B",
        "gray-900": "#0F172A",

        // Legacy support
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: ["72px", { lineHeight: "1.1", fontWeight: "700" }],
        h1: ["48px", { lineHeight: "1.2", fontWeight: "600" }],
        h2: ["32px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["24px", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
