/**
 * Typography System
 * Based on Wix Web Typography Rules
 * 
 * Key Principles:
 * - Use rem-based units for accessibility
 * - Line height: 1.5x for body text (Wix recommendation)
 * - Line length: 45-80 chars, ideal 66 chars
 * - Font: Inter (Google Fonts) - modern web font
 * - Spacing: 8px base grid
 */

// Typography Style Classes for consistent application
export const typography = {
  // Headings
  h1: 'text-4xl md:text-5xl font-bold tracking-tight leading-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight leading-tight',
  h3: 'text-2xl md:text-3xl font-semibold tracking-tight leading-snug',
  h4: 'text-xl md:text-2xl font-semibold tracking-tight leading-snug',
  h5: 'text-lg md:text-xl font-semibold leading-snug',
  h6: 'text-base md:text-lg font-semibold leading-snug',
  
  // Body Text
  bodyLarge: 'text-lg leading-relaxed',
  body: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-normal',
  caption: 'text-xs leading-normal',
  
  // Specialized
  label: 'text-sm font-medium tracking-wide uppercase',
  button: 'text-sm font-medium',
  link: 'text-base font-medium underline-offset-2 hover:underline',
  
  // Utility
  truncate: 'truncate',
  lineClamp2: 'line-clamp-2',
  lineClamp3: 'line-clamp-3',
} as const;

// Container widths for optimal reading (Wix: 45-80 chars, ideal 66)
export const container = {
  prose: 'max-w-prose',      // 66ch - ideal
  proseSm: 'max-w-prose-sm', // 45ch - minimum
  proseLg: 'max-w-prose-lg', // 80ch - maximum
  content: 'max-w-4xl',      // General content
  full: 'max-w-7xl',         // Full width container
} as const;

// Spacing scale (8px base)
export const spacing = {
  xs: 'space-y-1',    // 4px
  sm: 'space-y-2',    // 8px
  md: 'space-y-4',    // 16px
  lg: 'space-y-6',    // 24px
  xl: 'space-y-8',    // 32px
  '2xl': 'space-y-12', // 48px
} as const;

// Text colors for proper contrast
export const text = {
  primary: 'text-slate-900',
  secondary: 'text-slate-600',
  tertiary: 'text-slate-500',
  muted: 'text-slate-400',
  inverse: 'text-white',
  link: 'text-blue-600 hover:text-blue-700',
  error: 'text-red-600',
  success: 'text-green-600',
} as const;

// Combined heading with text color
export const heading = {
  h1: `${typography.h1} ${text.primary}`,
  h2: `${typography.h2} ${text.primary}`,
  h3: `${typography.h3} ${text.primary}`,
  h4: `${typography.h4} ${text.primary}`,
  h5: `${typography.h5} ${text.primary}`,
  h6: `${typography.h6} ${text.primary}`,
} as const;

// Usage example:
// <h1 className={heading.h1}>Title</h1>
// <p className={`${typography.body} ${text.secondary} ${container.prose}`}>
//   Content with optimal line length
// </p>
