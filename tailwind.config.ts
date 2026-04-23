import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        field: "#f7f0df",
        leaf: "#315c3b",
        gold: "#e6b450",
        clay: "#bd5a3a"
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
        body: ["Trebuchet MS", "Verdana", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 60px rgba(23, 33, 27, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
