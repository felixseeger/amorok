import React, { useEffect, useState } from 'react';
import { getNavigation, WPMenuItem } from '../lib/wp';

const FOOTER_MENU_SLUG = 'footer';

export const HomepageFooter: React.FC = () => {
  const [legalLinks, setLegalLinks] = useState<WPMenuItem[]>([]);

  useEffect(() => {
    getNavigation(FOOTER_MENU_SLUG).then(setLegalLinks);
  }, []);

  return (
    <footer className="bg-black border-t border-white/10 py-16 px-8 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-12">
        {/* Legal links from WordPress Footer menu */}
        {legalLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[10px] tracking-[0.3em] text-white/30 uppercase">
            {legalLinks.map((item) => (
              <a
                key={item.ID}
                href={item.url}
                target={item.target || '_self'}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="hover:text-white transition-colors"
              >
                {item.title}
              </a>
            ))}
          </div>
        )}

        <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase">
          © {new Date().getFullYear()} Amorok. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
