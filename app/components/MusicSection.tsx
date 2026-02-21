import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SequenceScroller } from './SequenceScroller';
import { PLANE_SEQUENCE } from '../constants';
import { getPageBySlug, WPPage } from '../lib/wp';

export const MusicSection: React.FC = () => {
  const [data, setData] = useState<WPPage | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const scalePlayer = useTransform(scrollYProgress, [0.1, 0.5], [0.9, 1]);

  useEffect(() => {
    getPageBySlug('home').then(setData);
  }, []);

  const acf = data?.acf;

  return (
    <SequenceScroller ref={containerRef} config={PLANE_SEQUENCE} height="400vh">
      <div className="flex flex-col h-full items-center justify-center px-12 md:px-24 py-12 md:py-16">
        <motion.div
          style={{ scale: scalePlayer }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full music-player-wrap"
          data-lenis-prevent
        >
          <div
            className="rounded-xl overflow-hidden border border-white/10 [&_iframe]:w-full [&_iframe]:max-h-[55vh] [&_iframe]:rounded-xl [&_iframe]:border-0 [&_iframe]:pointer-events-auto shadow-2xl shadow-black/50 overflow-y-auto max-h-[55vh] [&_iframe]:block"
            style={{ scrollbarWidth: 'thin' }}
            dangerouslySetInnerHTML={{
              __html: acf?.music_iframe ?? acf?.player_iframe ?? `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/artist/5YddGvcDaUZc4zZ3UkcCli?utm_source=generator" width="100%" height="500" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`,
            }}
          />
        </motion.div>
      </div>
    </SequenceScroller>
  );
};
