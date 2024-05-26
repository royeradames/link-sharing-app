import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'purple': '#633CFF',
        'purple-hover': '#BEADFF',
        'light-purple': '#EFEBFF',
        'dark-grey': '#333333',
        'grey': '#737373',
        'borders': '#D9D9D9',
        'light-grey': '#FAFAFA',
        'white': '#FFFFFF',
        'red': '#FF3939',
      },
    },
  },
  plugins: [],
};
export default config;
