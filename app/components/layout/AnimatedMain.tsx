'use client';

import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

interface AnimatedMainProps {
  children: React.ReactNode;
}

export default function AnimatedMain({ children }: AnimatedMainProps) {
  return (
    <motion.main 
      className="mx-auto max-w-[900px] px-4 flex-1 w-full"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.main>
  );
}
