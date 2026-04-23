import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2430",
        field: "#f7f2e8",
        leaf: "#12a6a2",
        gold: "#e8943b",
        clay: "#a6344a",
        navy: "#355e86",
        amber: "#e8943b",
        wine: "#a6344a",
        teal: "#12a6a2",
        cream: "#f7f2e8",
        graphite: "#1f2430"
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
        body: ["Trebuchet MS", "Verdana", "sans-serif"]
      },
      boxShadow: {
        card: "0 24px 70px rgba(31, 36, 48, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
