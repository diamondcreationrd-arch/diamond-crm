import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        diamond: {
          bg:      "#F7F5F0",
          surface: "#FFFFFF",
          raised:  "#F0EDE5",
          border:  "#E5E1D8",
          text:    "#18160F",
          muted:   "#857E6A",
          gold:    "#BD9F50",
          "gold-light": "#D4B96A",
          "gold-dark":  "#9A7E3A",
          "gold-bg":    "#FBF7EE",
        }
      },
      fontFamily: {
        display: ['"Funnel Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card:  "0 1px 3px 0 rgba(24,22,15,0.06), 0 1px 2px -1px rgba(24,22,15,0.04)",
        "card-hover": "0 4px 12px 0 rgba(24,22,15,0.10), 0 2px 4px -1px rgba(24,22,15,0.06)",
        gold:  "0 0 0 3px rgba(189,159,80,0.18)",
      },
    }
  },
  plugins: [],
};
export default config;
