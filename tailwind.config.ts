import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#14251E",
        ivory: "#F6F4ED",
        paper: "#FFFCF6",
        bronze: "#B68754",
        ink: "#202923",
        muted: "#777B70",
        line: "#E6E3D9",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
