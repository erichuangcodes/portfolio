"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLenis } from "./SmoothScroll";

// swift: cubic-bezier(0.65, 0, 0.35, 1)
// expo:  cubic-bezier(0.16, 1, 0.3, 1)
const swiftEase = [0.65, 0, 0.35, 1] as const;
const expoEase  = [0.16, 1, 0.3, 1] as const;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const isExiting = useRef(false);
  const reduced = useReducedMotion();

  const variants = {
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: {
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.6, ease: expoEase, delay: 0.1 },
    },
    exit: {
      opacity: 0,
      y: reduced ? 0 : -16,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.4, ease: swiftEase },
    },
  };

  useEffect(() => {
    if (!lenis) return;
    // Scroll to top immediately when route changes (before animations start)
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });
    // Pause during transition, resume after enter animation finishes
    lenis.stop();
    const id = setTimeout(() => lenis.start(), 700);
    return () => clearTimeout(id);
  }, [pathname, lenis]);

  return (
    <AnimatePresence
      mode="sync"
    >
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ willChange: "opacity, transform" }}
        onAnimationStart={(def) => {
          if (def === "exit") isExiting.current = true; // kept for potential future use
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
