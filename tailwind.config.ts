import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "dragon-duel": "url('/art/dragon-duel.png')",
      },
      animation: {
        "aura-spin": "aura-spin 18s linear infinite",
        "aura-pulse": "aura-pulse 4s ease-in-out infinite",
      },
      keyframes: {
        "aura-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "aura-pulse": {
          "0%,100%": { filter: "brightness(0.9) saturate(1)" },
          "50%": { filter: "brightness(1.3) saturate(1.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
