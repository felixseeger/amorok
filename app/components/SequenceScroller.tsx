
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { SequenceConfig } from '../types';

interface SequenceScrollerProps {
  config: SequenceConfig;
  height: string;
  children?: React.ReactNode;
}

const SequenceLoader: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]">
    <div className="text-white/60 text-sm tracking-[0.3em] uppercase mb-4">
      Loading
    </div>
    <div className="w-32 h-[1px] bg-white/20 relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-full bg-white"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.2 }}
      />
    </div>
    <div className="text-white/40 text-xs mt-2 tabular-nums">
      {progress}%
    </div>
  </div>
);

export const SequenceScroller = React.forwardRef<HTMLDivElement, SequenceScrollerProps>(({ config, height, children }, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = (ref as React.RefObject<HTMLDivElement>) || localRef;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { images, isLoaded, progress, error } = useImagePreloader(config);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Use the ref we have (either passed or local)
      const element = containerRef.current;
      if (!element || !isLoaded) return;

      const rect = element.getBoundingClientRect();
      const scrollProgress = -rect.top / (rect.height - window.innerHeight);
      const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);

      const frameIndex = Math.floor(clampedProgress * (config.frameCount - 1));
      setCurrentIndex(frameIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoaded, config.frameCount, containerRef]);

  useEffect(() => {
    if (isLoaded && canvasRef.current && images[currentIndex]) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const img = images[currentIndex];

        // Resize canvas to fit screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Cover logic for canvas
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > imgRatio) {
          drawHeight = canvas.width / imgRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    }
  }, [currentIndex, isLoaded, images]);

  return (
    <div ref={containerRef} style={{ height }} className="relative">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#050505]">
        {!isLoaded && !error && <SequenceLoader progress={progress} />}
        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#050505]">
            <span className="text-white/40 text-sm">{error}</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-10 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
});

SequenceScroller.displayName = 'SequenceScroller';
