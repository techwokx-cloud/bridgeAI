import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6845d8",
          pink: "#df3f9b",
          light: "#fffaf8",
          darker: "#201b3e",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
      },
    },
  },
  plugins: [],
};

export default config;
