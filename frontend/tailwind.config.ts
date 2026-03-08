import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#136aec",
        "background-light": "#F8F8F6",
        "background-dark": "#101722",
        "warm-white": "#FDFCF8",
        "pure-black": "#1A1A1A",
        "warm-text": "#FDFCF8",
        "gray-icon": "#6B7280",
        "gray-border": "#E5E7EB",
        "selected-border": "#4B5563",
        "civic-cream": "#F5F2EA",
        "civic-gray": "#D1D5DB",
        "cream-sidebar": "rgba(253, 252, 248, 0.85)",
        "gray-text": "#6B7280",
        "muted-red": "#E08D79",
        "muted-blue": "#8DA9C4",
        "muted-green": "#9EB5A3",
        "muted-gold": "#C9B68D",
        "party-uxp": "#1A5FA8",
        "party-lla": "#9B59B6",
        "party-jxc": "#F4D03F",
        "party-hcf": "#E67E22",
        "party-fit": "#E74C3C",
        "alethia-primary": "#1A1A2E",
        "alethia-accent": "#16213E",
        "alethia-highlight": "#0F3460",
        "alethia-gold": "#E2B714",
      },
      fontFamily: {
        display: ["var(--font-public-sans)", "Public Sans", "sans-serif"],
        serif: ["var(--font-fraunces)", "Fraunces", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        mono: ["var(--font-dm-mono)", "DM Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        subtle: "0 8px 24px -4px rgba(0, 0, 0, 0.04)",
        selected: "0 8px 24px -4px rgba(0, 0, 0, 0.08)",
        glass: "0 4px 30px rgba(0, 0, 0, 0.03)",
      },
      backgroundImage: {
        "civic-texture": "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
