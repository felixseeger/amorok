import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SequenceScroller } from './SequenceScroller';
import { CharacterFadeIn } from './CharacterFadeIn';
import { INTERIOR_SEQUENCE, LUXURY_COPY } from '../constants';
import { getPageBySlug, WPPage } from '../lib/wp';

function getAboutImageUrl(acf: WPPage['acf']): string | null {
  const img = acf?.about_image;
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object' && 'url' in img) return img.url;
  return null;
}

export const AboutSection: React.FC = () => {
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
    const contentText = rawContent ? stripHtml(rawContent) : null;
    // About section: ACF about_title, fallback to interior_title / page title
    const title = (acf?.about_title ?? acf?.title ?? acf?.interior_title ?? data?.title?.rendered ?? LUXURY_COPY.interior_title) as string;
    // About text: ACF about_text (primary), about_content, interior_text, about_description, then post content
    const text = (acf?.about_text ?? acf?.About_text ?? acf?.about_content ?? acf?.text ?? acf?.interior_text ?? acf?.about_description ?? contentText ?? LUXURY_COPY.interior_text) as string;
    // About subtitle & quote: ACF about_subtitle, about_quote
    const subtitle = (acf?.about_subtitle ?? acf?.subtitle) as string | undefined;
    const quote = (acf?.about_quote ?? acf?.quote) as string | undefined;
    const imageUrl = getAboutImageUrl(data?.acf) ?? (typeof acf?.image === 'string' ? acf.image : (acf?.image as { url?: string })?.url) ?? null;
    const stats = [
      acf?.about_stat_1 ?? acf?.stat_1,
      acf?.about_stat_2 ?? acf?.stat_2,
      acf?.about_stat_3 ?? acf?.stat_3,
    ].filter(Boolean) as string[];

    return (
        <SequenceScroller config={INTERIOR_SEQUENCE} height="400vh">
            <div className="flex flex-col items-center justify-center h-full px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl w-full p-8 md:p-12 text-left"
                >
                    <h2 className="text-4xl md:text-7xl font-mr-dafoe tracking-normal mb-4 text-white text-left">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm md:text-lg text-white/50 tracking-[0.3em] uppercase mb-6">
                            {subtitle}
                        </p>
                    )}
                    <div className="w-24 h-[1px] bg-white/50 mb-8" />
                    {imageUrl && (
                        <div className="mb-8 rounded-lg overflow-hidden">
                            <img
                                src={imageUrl}
                                alt=""
                                className="w-full max-h-64 object-cover"
                            />
                        </div>
                    )}
                    {quote && (
                        <blockquote className="text-xl md:text-2xl text-white/90 font-light italic mb-6">
                            "{quote}"
                        </blockquote>
                    )}
                    <CharacterFadeIn
                        text={text}
                        className="text-lg md:text-2xl text-white/80 font-light tracking-wide leading-relaxed text-left"
                        as="p"
                    />
                    {stats.length > 0 && (
                        <div className="flex flex-wrap justify-start gap-8 mt-10 pt-8 border-t border-white/20">
                            {stats.map((stat, i) => (
                                <span key={i} className="text-white/60 text-sm tracking-widest uppercase">
                                    {stat}
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </SequenceScroller>
    );
};
