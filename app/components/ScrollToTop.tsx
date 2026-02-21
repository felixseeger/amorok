import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from './SmoothScroll';

export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const lenisRef = useLenis();

  useEffect(() => {
    const lenis = lenisRef?.current;
    if (!lenis) return;

    const onScroll = () => {
      setVisible(lenis.scroll > 400);
    };

    onScroll();
    lenis.on('scroll', onScroll);
    return () => lenis.off('scroll', onScroll);
  }, [lenisRef]);

  const scrollToTop = () => {
    lenisRef?.current?.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[90] w-12 h-12 flex items-center justify-center rounded-full border border-white/30 bg-black/50 backdrop-blur-sm text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
