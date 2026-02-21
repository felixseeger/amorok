import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPageBySlug, WPPage } from '../lib/wp';

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/amorokk1/', label: 'Instagram', icon: '/assets/instagram.png' },
  { href: 'https://www.youtube.com/channel/UC8LMx_UQtl_h1KWP5BOePmw', label: 'YouTube', icon: '/assets/youtube.png' },
  { href: 'https://open.spotify.com/intl-de/artist/58socPRj8N2GwafpqfJYKE', label: 'Spotify', icon: '/assets/spotify.png' },
];

const DEFAULTS = {
  title: 'Follow & Join',
  subtitle: 'Connected to every major destination worldwide.',
  videoUrl: '/globe-loop.mp4',
  posterUrl: '/globe.jpg',
};

export const FollowJoinSection: React.FC = () => {
  const [data, setData] = useState<WPPage | null>(null);

  useEffect(() => {
    getPageBySlug('home').then(setData);
  }, []);

  const acf = data?.acf;
  const title = acf?.follow_join_title ?? DEFAULTS.title;
  const subtitle = acf?.followjoin_text ?? acf?.follow_join_subtitle ?? DEFAULTS.subtitle;
  const videoUrl = acf?.follow_join_video_url ?? DEFAULTS.videoUrl;
  const posterUrl = acf?.follow_join_poster_url ?? DEFAULTS.posterUrl;
  const contactEmail = acf?.contact_email;
  const contactPhone = acf?.contact_phone;

  return (
    <section id="follow-join" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-5xl md:text-8xl font-mr-dafoe tracking-normal">{title}</h2>
            <p className="text-sm md:text-xl text-white/40 tracking-[0.4em] uppercase font-light">
              {subtitle}
            </p>
            {(contactEmail || contactPhone) && (
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm tracking-[0.2em] text-white/50 uppercase font-light pt-2">
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                    {contactEmail}
                  </a>
                )}
                {contactPhone && (
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                    {contactPhone}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 pt-12">
            {SOCIAL_LINKS.map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
                aria-label={label}
              >
                <img src={icon} alt="" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
