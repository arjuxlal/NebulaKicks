import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "deep-dark": "#050510",
        "neon-cyan": "#00f2ea",
        "ultraviolet": "#ff00ff",
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px #00f2ea',
        'glow-cyan-lg': '0 0 25px #00f2ea',
        'glow-purple': '0 0 15px #ff00ff',
        'glow-purple-lg': '0 0 25px #ff00ff',
      }
    },
  },
  plugins: [],
};
export default config;
