import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#faf8f4',
        ivory: '#f2ede4',
        bone: '#e8e0d2',
        gold: {
          DEFAULT: '#b8975a',
          light: '#d4b07a',
          pale: '#f5edd8',
        },
        ink: {
          DEFAULT: '#0f0e0c',
          2: '#3a3730',
          3: '#7a756e',
        },
      },
    },
  },
  plugins: [],
}

export default config
