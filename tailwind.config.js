/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        win: {
          bg: '#181818',
          surface: '#1f1f1f',
          card: '#252525',
          sidebar: '#181818',
          border: '#2b2b2b',
          borderLight: '#383838',
          hover: '#2a2a2a',
          active: '#333333',
          accent: '#0078d4',
          accentHover: '#1084d8',
          accentLight: '#60cdff',
          text: '#cccccc',
          textBright: '#ffffff',
          muted: '#858585',
          danger: '#f14c4c',
          success: '#23d18b',
          warning: '#cca700',
        },
        turbo: {
          blue: '#0000AA',
          yellow: '#FFFF55',
          cyan: '#55FFFF',
          green: '#55FF55',
          gray: '#AAAAAA',
          darkBlue: '#000088',
        }
      },
      fontFamily: {
        sans: ['"Segoe UI Variable"', '"Segoe UI"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"Cascadia Code"', 'Consolas', '"Fira Code"', '"Courier New"', 'monospace'],
        dos: ['"Px437 IBM VGA 8x16"', 'Fixedsys', 'monospace'],
      },
      boxShadow: {
        fluent: '0 4px 12px rgba(0, 0, 0, 0.35)',
        popup: '0 8px 24px rgba(0, 0, 0, 0.45)',
        subtle: '0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        control: '4px',
        card: '6px',
        window: '8px',
      }
    },
  },
  plugins: [],
}
