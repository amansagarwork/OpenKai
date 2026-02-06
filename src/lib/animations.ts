/**
 * Animation Variants for Framer Motion
 * Smooth, fluid interactions based on modern UI/UX principles
 */

import { Variants } from 'framer-motion';

// Page transition animations
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1], // Smooth cubic-bezier
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
    }
  },
};

// Fade in animation
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

// Slide in from left (for mobile menu)
export const slideInLeft: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    }
  },
  exit: { 
    x: '-100%', 
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    }
  },
};

// Backdrop fade for overlays
export const backdropFade: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

// Dropdown/menu animations
export const dropdown: Variants = {
  initial: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 }
  },
};

// Button tap animation
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 }
};

// Card hover animation
export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  }
};

// Stagger children animation
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    }
  },
};

// Pop in animation for badges/notifications
export const popIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

// Smooth height animation for accordions
export const smoothHeight: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { 
    height: 'auto', 
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      opacity: { duration: 0.2, delay: 0.1 }
    }
  },
  exit: { 
    height: 0, 
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      opacity: { duration: 0.2 }
    }
  },
};
