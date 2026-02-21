
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SequenceScroller } from './SequenceScroller';
import { HERO_SEQUENCE, LUXURY_COPY } from '../constants';
import { getPageBySlug, WPPage } from '../lib/wp';

export const HeroSection: React.FC = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.1]);

  const [data, setData] = useState<WPPage | null>(null);

  useEffect(() => {
    getPageBySlug('home').then(setData);
  }, []);

  const acf = data?.acf as Record<string, unknown> | undefined;
  const rawContent = typeof data?.content === 'object' && data?.content !== null && 'rendered' in data.content
    ? (data.content as { rendered?: string }).rendered
    : typeof data?.content === 'string'
      ? data.content
      : undefined;
  const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  const contentSnippet = rawContent ? stripHtml(rawContent).slice(0, 120) : undefined;

  const title = (acf?.hero_title ?? data?.title?.rendered ?? LUXURY_COPY.hero_title) as string;
  const subtitle = (acf?.hero_subtitle ?? contentSnippet ?? LUXURY_COPY.hero_subtitle) as string;

  return (
    <SequenceScroller config={HERO_SEQUENCE} height="400vh">
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          style={{ opacity, scale }}
          className="space-y-6"
        >
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-9xl font-mr-dafoe tracking-normal text-white"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm md:text-lg tracking-[0.5em] font-light text-white/60 uppercase"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-white/40">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
            <motion.div
              animate={{ y: [0, 48] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-4 bg-white"
            />
          </div>
        </motion.div>
      </div>
    </SequenceScroller>
  );
};
