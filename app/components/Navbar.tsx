import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNavigation, WPMenuItem } from '../lib/wp';
import { useCursor } from './CustomCursor';
import { useSound } from './SoundProvider';

export const Navbar: React.FC = () => {
  const [menuItems, setMenuItems] = useState<WPMenuItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { setCursorVariant, setCursorText } = useCursor();
  const { playHover, playClick } = useSound();

  useEffect(() => {
    const fetchMenu = async () => {
      const items = await getNavigation('main-menu');
      if (items && items.length > 0) {
        setMenuItems(items);
      }
    };
    fetchMenu();
  }, []);

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    playClick();
    // Check if it's an anchor link
    if (url.startsWith('#') || (url.includes(window.location.origin) && url.includes('#'))) {
      const hash = url.includes('#') ? url.split('#')[1] : null;
      if (hash) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setIsOpen(false);
        }
      }
    }
  };

  const handleMouseEnter = (text: string = '') => {
    setCursorVariant('text');
    setCursorText(text);
    playHover();
  };

  const handleMouseLeave = () => {
    setCursorVariant('default');
    setCursorText('');
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  // Fallback items if fetch fails (matching WPMenuItem shape mostly for rendering)
  const defaultItems: Partial<WPMenuItem>[] = [
    { ID: 1, title: 'About', url: '#about' },
    { ID: 2, title: 'Music', url: '#music' },
    { ID: 3, title: 'Videos', url: '#videos' },
  ];

  const allItems = menuItems.length > 0 ? menuItems : defaultItems;
  // Exclude "Follow & Join" from menu links (shown as button instead)
  const itemsToRender = allItems.filter(
    (item) => item.title !== 'Follow & Join' && item.url !== '#follow-join'
  );

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 w-full z-[100] px-4 md:px-8 py-4 md:py-6 flex justify-between items-center ${isOpen ? '' : 'mix-blend-difference'}`}
    >
      {/* Desktop: [About] [Logo] [Music, Videos, Follow & Join] — equal-width sides so logo is centered */}
      <div className="hidden md:flex flex-1 items-center justify-center w-full max-w-5xl mx-auto">
        <div className="flex flex-1 items-center justify-end gap-6 pr-6 text-2xl font-mr-dafoe tracking-normal font-normal">
          {itemsToRender[0] && (
            <a
              key={itemsToRender[0].ID || itemsToRender[0].title}
              href={itemsToRender[0].url}
              onClick={(e) => handleLinkClick(e, itemsToRender[0].url)}
              onMouseEnter={() => handleMouseEnter('View')}
              onMouseLeave={handleMouseLeave}
              className="hover:opacity-50 transition-opacity cursor-none"
            >
              {itemsToRender[0].title}
            </a>
          )}
        </div>
        <a
          href="#"
          onClick={scrollToTop}
          className="text-2xl md:text-3xl font-mr-dafoe tracking-normal relative z-[110] cursor-none shrink-0 hover:opacity-80 transition-opacity"
          onMouseEnter={() => handleMouseEnter('Home')}
          onMouseLeave={handleMouseLeave}
        >
          Amorok
        </a>
        <div className="flex flex-1 items-center justify-between pl-6">
          <div className="flex gap-6 text-2xl font-mr-dafoe tracking-normal font-normal items-center">
            {(() => {
              const rightItems = itemsToRender.slice(1);
              const nodes: React.ReactNode[] = [];
              for (let i = 0; i < rightItems.length; i++) {
                const item = rightItems[i];
                const next = rightItems[i + 1];
                const isMusic = item.title === 'Music' || item.url === '#music';
                const isVideosNext = next && (next.title === 'Videos' || next.url === '#videos');
                if (isMusic && isVideosNext) {
                  nodes.push(
                    <div key={`music-videos-${item.ID}`} className="flex items-center gap-1.5">
                      <a
                        href={item.url}
                        onClick={(e) => handleLinkClick(e, item.url)}
                        onMouseEnter={() => handleMouseEnter('View')}
                        onMouseLeave={handleMouseLeave}
                        className="hover:opacity-50 transition-opacity cursor-none"
                      >
                        {item.title}
                      </a>
                      <span className="cursor-default"> & </span>
                      <a
                        href={next!.url}
                        onClick={(e) => handleLinkClick(e, next!.url)}
                        onMouseEnter={() => handleMouseEnter('View')}
                        onMouseLeave={handleMouseLeave}
                        className="hover:opacity-50 transition-opacity cursor-none"
                      >
                        {next!.title}
                      </a>
                    </div>
                  );
                  i++;
                  continue;
                }
                nodes.push(
                  <a
                    key={item.ID || item.title}
                    href={item.url}
                    onClick={(e) => handleLinkClick(e, item.url)}
                    onMouseEnter={() => handleMouseEnter('View')}
                    onMouseLeave={handleMouseLeave}
                    className="hover:opacity-50 transition-opacity cursor-none"
                  >
                    {item.title}
                  </a>
                );
              }
              return nodes;
            })()}
          </div>
          <button
            onClick={() => {
              playClick();
              document.getElementById('follow-join')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onMouseEnter={() => handleMouseEnter('Follow & Join')}
            onMouseLeave={handleMouseLeave}
            className="text-xl font-mr-dafoe tracking-normal px-6 py-2 hover:bg-white hover:text-black transition-all cursor-none shrink-0"
          >
            Follow & Join
          </button>
        </div>
      </div>

      {/* Mobile: logo left, burger right */}
      <div className="md:hidden flex flex-1 justify-between items-center w-full">
        <a
          href="#"
          onClick={scrollToTop}
          className="text-2xl font-mr-dafoe tracking-normal relative z-[110] cursor-none hover:opacity-80 transition-opacity"
          onMouseEnter={() => handleMouseEnter('Home')}
          onMouseLeave={handleMouseLeave}
        >
          Amorok
        </a>

      {/* Mobile Burger */}
      <button
        className="md:hidden z-[110] relative p-2 focus:outline-none cursor-none"
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => handleMouseEnter(isOpen ? 'Close' : 'Menu')}
        onMouseLeave={handleMouseLeave}
        aria-label="Toggle menu"
      >
        <div className="w-8 h-6 flex flex-col justify-between">
          <span className={`block w-full h-0.5 bg-white transition-transform duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-[11px]' : ''}`} />
          <span className={`block w-full h-0.5 bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-full h-0.5 bg-white transition-transform duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-[11px]' : ''}`} />
        </div>
      </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center gap-8"
          >
            {itemsToRender.map((item, index) => {
              const prev = itemsToRender[index - 1];
              const next = itemsToRender[index + 1];
              const isMusic = item.title === 'Music' || item.url === '#music';
              const isVideos = item.title === 'Videos' || item.url === '#videos';
              const showAmpAfter = isMusic && next && (next.title === 'Videos' || next.url === '#videos');
              const isVideosWithAmpBefore = isVideos && prev && (prev.title === 'Music' || prev.url === '#music');
              if (isVideosWithAmpBefore) return null;
              return (
                <div key={item.ID || item.title} className="flex flex-wrap items-center justify-center gap-x-2 gap-y-8">
                  <a
                    href={item.url}
                    onClick={(e) => handleLinkClick(e, item.url)}
                    className="text-4xl font-mr-dafoe text-white tracking-wide cursor-none"
                  >
                    {item.title}
                  </a>
                  {showAmpAfter && (
                    <>
                      <span className="text-4xl font-mr-dafoe text-white tracking-wide"> & </span>
                      <a
                    href={itemsToRender[index + 1].url}
                    onClick={(e) => handleLinkClick(e, itemsToRender[index + 1].url)}
                    className="text-4xl font-mr-dafoe text-white tracking-wide cursor-none"
                  >
                    {itemsToRender[index + 1].title}
                  </a>
                    </>
                  )}
                </div>
              );
            })}
            <button
              onClick={() => {
                playClick();
                document.getElementById('follow-join')?.scrollIntoView({ behavior: 'smooth' });
                setIsOpen(false);
              }}
              className="mt-8 text-2xl font-mr-dafoe tracking-normal px-8 py-3 hover:bg-white hover:text-black transition-all cursor-none"
            >
              Follow & Join
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
