import React, { useState, useEffect } from 'react';
import { SmoothScroll } from './components/SmoothScroll';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MusicSection } from './components/MusicSection';
import { AboutSection } from './components/AboutSection';
import { VideosSection } from './components/VideosSection';
import { FollowJoinSection } from './components/FollowJoinSection';
import { HomepageFooter } from './components/HomepageFooter';
import { motion, AnimatePresence } from 'framer-motion';


const Loader: React.FC = () => (
  <motion.div
    exit={{ opacity: 0 }}
    transition={{ duration: 1, ease: "easeInOut" }}
    className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center gap-8"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-2xl font-mr-dafoe tracking-normal"
    >
      Amorok
    </motion.div>
    <div className="w-48 h-[1px] bg-white/10 relative">

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute top-0 left-0 h-full bg-white"
      />
    </div>
  </motion.div>
);

import { GrainOverlay } from './components/GrainOverlay';
import { CursorProvider } from './components/CustomCursor';
import { SoundProvider } from './components/SoundProvider';
import { ScrollToTop } from './components/ScrollToTop';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading sequence
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CursorProvider>
      <SoundProvider>
        <GrainOverlay />
        <SmoothScroll>
          <AnimatePresence>
            {loading && <Loader />}
          </AnimatePresence>

          {!loading && (
            <main className="bg-[#050505] text-white min-h-screen">
              <Navbar />

              <HeroSection />

              <section id="about">
                <AboutSection />
              </section>

              <section id="music">
                <MusicSection />
              </section>

              <VideosSection />

              <FollowJoinSection />

              <HomepageFooter />

              <ScrollToTop />
            </main>
          )}
        </SmoothScroll>
      </SoundProvider>
    </CursorProvider>
  );
};

export default App;
