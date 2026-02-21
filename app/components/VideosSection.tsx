import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getVideos, getVideoPosts, WPVideo, toImageUrl } from '../lib/wp';

/** Resolve video source URL from a WPVideo item */
function getVideoSrc(video: WPVideo): string | null {
  const acf = video.acf;
  if (acf?.video_url) return acf.video_url;
  if (acf?.video_file) return acf.video_file;
  return null;
}

/** Resolve poster/thumbnail URL from a WPVideo item (ACF poster fields + featured media) */
function getPosterSrc(video: WPVideo): string | null {
  const acf = video.acf;
  if (acf?.poster_url) return acf.poster_url;
  const videoPoster = (acf as Record<string, unknown>)?.video_poster;
  if (videoPoster && videoPoster !== false) {
    const vp = toImageUrl(videoPoster);
    if (vp) return vp;
  }
  if (typeof (acf as Record<string, unknown>)?.image_url === 'string') return (acf as Record<string, unknown>).image_url as string;
  const poster = toImageUrl(acf?.poster);
  if (poster) return poster;
  const thumb = toImageUrl(acf?.thumbnail);
  if (thumb) return thumb;
  const posterImage = toImageUrl(acf?.poster_image);
  if (posterImage) return posterImage;
  const image = toImageUrl(acf?.image);
  if (image) return image;
  const featuredImg = toImageUrl((acf as Record<string, unknown>)?.featured_image);
  if (featuredImg) return featuredImg;
  const cover = toImageUrl((acf as Record<string, unknown>)?.cover);
  if (cover) return cover;
  const thumbAlt = toImageUrl((acf as Record<string, unknown>)?.thumb);
  if (thumbAlt) return thumbAlt;
  const media = video._embedded?.['wp:featuredmedia'];
  if (media?.[0]?.source_url) return media[0].source_url;
  return null;
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').trim() || '';
}

/** Normalize YouTube URLs to watch format for reliable external routing */
function normalizeYouTubeUrl(url: string): string {
  const trimmed = url.trim();
  const short = /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/i.exec(trimmed);
  if (short) return `https://www.youtube.com/watch?v=${short[2]}`;
  const embed = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i.exec(trimmed);
  if (embed) return `https://www.youtube.com/watch?v=${embed[1]}`;
  return trimmed;
}

/** YouTube watch URL for card link (all videos are YouTube-hosted) */
function getYouTubeCardUrl(src: string | null): string {
  if (!src) return '#';
  if (/youtube|youtu\.be/i.test(src)) return normalizeYouTubeUrl(src);
  return src;
}

export const VideosSection: React.FC = () => {
  const [videos, setVideos] = useState<WPVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getVideos('videos'),
      getVideos('video'),
      getVideoPosts(),
    ]).then(([cptVideos, cptVideo, videoPosts]) => {
      const fromCpt = cptVideos.length > 0 ? cptVideos : cptVideo;
      const seen = new Set<number>();
      const combined: WPVideo[] = [];
      for (const v of [...fromCpt, ...videoPosts]) {
        if (seen.has(v.id)) continue;
        seen.add(v.id);
        combined.push(v);
      }
      setVideos(combined);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section id="videos" className="min-h-screen py-24 px-6 md:px-12 bg-[#050505] flex items-center justify-center">
        <div className="text-white/50 text-lg">Loading videos...</div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section id="videos" className="min-h-screen py-24 px-6 md:px-12 bg-[#050505] flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl md:text-8xl font-mr-dafoe tracking-normal text-white mb-4">Videos</h2>
        <p className="text-white/40 tracking-wide">No videos yet.</p>
      </section>
    );
  }

  return (
    <section id="videos" className="min-h-screen py-24 px-6 md:px-12 lg:px-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {videos.map((video, i) => {
            const src = getVideoSrc(video);
            const poster = getPosterSrc(video) || '/globe.jpg';
            const cardUrl = getYouTubeCardUrl(src);
            const title = stripHtml(video.title?.rendered || '');
            const excerpt = stripHtml(video.excerpt?.rendered || '') || stripHtml(video.content?.rendered || '').slice(0, 120);
            const caption = video.acf?.caption || video.acf?.description;

            return (
              <motion.article
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group"
              >
                <a
                  href={cardUrl}
                  {...(cardUrl !== '#' && { target: '_blank', rel: 'noopener noreferrer' })}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] rounded-lg"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/30 transition-colors">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${poster})` }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-black text-2xl hover:scale-110 transition-transform pointer-events-none">
                        ▶
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-white group-hover:text-white/90 transition-colors">
                      {title}
                    </h3>
                    {(caption || excerpt) && (
                      <p className="text-sm text-white/50 mt-2 line-clamp-2">
                        {caption || excerpt}
                      </p>
                    )}
                  </div>
                </a>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
