import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070d",
          900: "#080b14",
          850: "#0b1020",
          800: "#10172a",
          700: "#182238",
          600: "#24304a",
        },
        fg: {
          DEFAULT: "#e8ecf4",
          2: "#a7b0c4",
          3: "#717c95",
        },
        line: "rgba(148, 163, 184, 0.14)",
        direct: "#4c8dff",
        regular: "#e25d2c",
        index: "#8c96ab",
        mint: "#3ddc97",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', "system-ui", "sans-serif"],
        sans: ['"Hanken Grotesk Variable"', "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1200px",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        shimmer: "shimmer 3.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
