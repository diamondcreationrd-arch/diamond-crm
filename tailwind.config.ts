import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        diamond: {
          black: "#171510",
          gold: "#BD9F50",
          "gold-light": "#D4B96A",
          "gold-dark": "#9A7E3A",
          surface: "#1E1B14",
          border: "#2A2518",
          muted: "#6B6550",
        }
      },
      fontFamily: {
        display: ['"Funnel Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        display: '0.02em',
      }
    }
  },
  plugins: [],
};
export default config;
