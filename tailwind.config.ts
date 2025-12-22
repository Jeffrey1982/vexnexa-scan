import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // VexNexa Brand Colors
        primary: {
          DEFAULT: '#1E1E1E',
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#666666',
          600: '#4D4D4D',
          700: '#333333',
          800: '#262626',
          900: '#1E1E1E', // Midnight Graphite
        },
        accent: {
          DEFAULT: '#FF6B35',
          50: '#FFF3EF',
          100: '#FFE7DF',
          200: '#FFCFBF',
          300: '#FFB79F',
          400: '#FF9F7F',
          500: '#FF875F',
          600: '#FF6B35', // Aurora Orange
          700: '#E65520',
          800: '#B34419',
          900: '#803112',
        },
        secondary: {
          DEFAULT: '#118AB2',
          50: '#E6F4F8',
          100: '#CCE9F1',
          200: '#99D3E3',
          300: '#66BDD5',
          400: '#33A7C7',
          500: '#1497B8',
          600: '#118AB2', // Plasma Blue
          700: '#0E6E8E',
          800: '#0A526A',
          900: '#073646',
        },
        highlight: {
          DEFAULT: '#FFD166',
          50: '#FFFBF0',
          100: '#FFF7E1',
          200: '#FFEFC3',
          300: '#FFE7A5',
          400: '#FFDF87',
          500: '#FFD769',
          600: '#FFD166', // Solar Gold
          700: '#FFBD33',
          800: '#FFA900',
          900: '#CC8700',
        },
        neutral: {
          DEFAULT: '#C0C3C7',
          50: '#F8F9FA', // Cloud White (background)
          100: '#F1F2F4',
          200: '#E3E5E8',
          300: '#D5D7DC',
          400: '#C7CAD0',
          500: '#C0C3C7', // Ash Gray
          600: '#9DA0A5',
          700: '#7A7D82',
          800: '#585A5F',
          900: '#35373C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
