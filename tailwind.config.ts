import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        quintes: {
          bg: "#000000",
          surface: "#111111",
          border: "#AAA9AC",
          text: "#FAFAFA",
          muted: "#949494",
          dark: "#1E1D1E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "quintes-gradient": "linear-gradient(111.43deg, #FAFAFA 19.33%, #878787 44.82%, #FFFFFF 70.31%)",
        "quintes-radial": "radial-gradient(50% 50% at 50% 50%, #FAFAFA 0%, #949494 100%)",
      },
      boxShadow: {
        "quintes-glow": "0 0 40px rgba(250, 250, 250, 0.15)",
        "quintes-inset": "inset 0 0 57.7px #FAFAFA, inset 0 79px 77.6px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
