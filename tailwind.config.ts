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
        mondwest: ['var(--font-mondwest)', 'sans-serif'],
      },
      backgroundImage: {
        'solana-gradient': 'linear-gradient(to right, #9945FF, #14F195)',
      },
      colors: {
        'solana-purple': '#9945FF',
        'solana-green': '#14F195',
      },
    },
  },
  plugins: [],
}

export default config
