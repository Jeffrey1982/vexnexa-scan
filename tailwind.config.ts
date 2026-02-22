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
          DEFAULT: '#FF6B35',
          hover: '#FF8A5B',
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
        teal: {
          DEFAULT: '#0F5C5C',
          50: '#E6F2F2',
          100: '#CCE5E5',
          200: '#99CBCB',
          300: '#66B1B1',
          400: '#339797',
          500: '#1A7A7A',
          600: '#0F5C5C',
          700: '#0C4A4A',
          800: '#093838',
          900: '#062626',
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
          500: '#C0C3C7', // Ash Gray / Borders
          600: '#9DA0A5',
          700: '#7A7D82',
          800: '#585A5F',
          900: '#35373C',
        },
        'text-primary': '#141414',
        'text-muted': '#5A5A5A',
        background: '#F8F9FA',
        border: '#C0C3C7',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B35, #FF8A5B)',
        'gradient-teal': 'linear-gradient(135deg, #0F5C5C, #1A7A7A)',
        'gradient-hero': 'linear-gradient(135deg, #0F5C5C 0%, #1A7A7A 50%, #FF6B35 100%)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#141414',
            '--tw-prose-headings': '#141414',
            '--tw-prose-links': '#FF6B35',
            '--tw-prose-bold': '#141414',
            '--tw-prose-counters': '#5A5A5A',
            '--tw-prose-bullets': '#5A5A5A',
            '--tw-prose-hr': '#C0C3C7',
            '--tw-prose-quotes': '#141414',
            '--tw-prose-quote-borders': '#FF6B35',
            '--tw-prose-captions': '#5A5A5A',
            '--tw-prose-code': '#141414',
            '--tw-prose-pre-code': '#F8F9FA',
            '--tw-prose-pre-bg': '#141414',
            '--tw-prose-th-borders': '#C0C3C7',
            '--tw-prose-td-borders': '#E3E5E8',
            color: '#141414',
            maxWidth: 'none',
            a: {
              color: '#FF6B35',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: '#FF8A5B',
                textDecoration: 'underline',
              },
            },
            strong: {
              color: '#141414',
              fontWeight: '600',
            },
            h1: {
              color: '#141414',
              fontWeight: '700',
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, system-ui, sans-serif',
            },
            h2: {
              color: '#141414',
              fontWeight: '600',
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, system-ui, sans-serif',
            },
            h3: {
              color: '#141414',
              fontWeight: '600',
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, system-ui, sans-serif',
            },
            h4: {
              color: '#141414',
              fontWeight: '600',
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, system-ui, sans-serif',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
