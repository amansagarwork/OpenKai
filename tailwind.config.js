/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Modern Typography System (Based on Wix Web Typography Rules)
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      
      // Font Size Scale (rem-based for accessibility)
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }],     // 14px
        'base': ['1rem', { lineHeight: '1.6' }],      // 16px - Body text
        'lg': ['1.125rem', { lineHeight: '1.5' }],     // 18px
        'xl': ['1.25rem', { lineHeight: '1.4' }],      // 20px
        '2xl': ['1.5rem', { lineHeight: '1.3' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '1.2' }],    // 30px
        '4xl': ['2.25rem', { lineHeight: '1.2' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1.1' }],        // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1' }],     // 60px
      },
      
      // Line Height Scale
      lineHeight: {
        'tight': '1.2',    // Headings
        'snug': '1.3',     // Subheadings
        'normal': '1.5',   // Body (Wix recommends 1.5x)
        'relaxed': '1.6',  // Large body text
        'loose': '1.8',    // Small/light fonts
      },
      
      // Letter Spacing
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      
      // Max Width for Readable Line Lengths (Wix: 45-80 chars, ideal 66)
      maxWidth: {
        'prose': '66ch',      // Ideal line length
        'prose-sm': '45ch',   // Minimum
        'prose-lg': '80ch',   // Maximum
      },
      
      // Spacing Scale (8px base)
      spacing: {
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '9': '2.25rem',     // 36px
        '10': '2.5rem',     // 40px
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
      },
      
      // Border Radius Scale
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'DEFAULT': '0.5rem', // 8px
        'md': '0.75rem',    // 12px
        'lg': '1rem',       // 16px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
      },
    },
  },
  plugins: [],
};
