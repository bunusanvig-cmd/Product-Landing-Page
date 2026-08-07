import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          400: '#5d6573',
          500: '#4c5565',
          600: '#364257',
          700: '#243247',
          950: '#09111f',
          900: '#0d1729',
          800: '#16233b',
        },
        sand: {
          50: '#f8f3eb',
          100: '#f1e7d8',
        },
        gold: {
          300: '#f7d48c',
          400: '#eec15d',
          500: '#d9a43a',
        },
      },
      boxShadow: {
        glow: '0 20px 80px rgba(217,164,58,0.18)',
        panel: '0 24px 60px rgba(7, 15, 28, 0.22)',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(circle at top left, rgba(247, 212, 140, 0.30), transparent 36%), radial-gradient(circle at top right, rgba(75, 105, 255, 0.20), transparent 34%), linear-gradient(180deg, #08101c 0%, #0d1729 55%, #f8f3eb 55%, #f8f3eb 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
