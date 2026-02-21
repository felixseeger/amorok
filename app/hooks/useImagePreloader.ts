
import { useState, useEffect } from 'react';
import { SequenceConfig } from '../types';

export const useImagePreloader = (config: SequenceConfig) => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let loadedCount = 0;
    let failedCount = 0;
    const preloadedImages: HTMLImageElement[] = [];
    let cancelled = false;

    const startIndex = config.startIndex ?? 0;

    const loadImage = (index: number) => {
      const img = new Image();
      const fileIndex = index + startIndex;
      const paddedIndex = String(fileIndex).padStart(3, '0');
      img.src = `${config.path}${config.prefix}${paddedIndex}.${config.extension}`;

      img.onload = () => {
        if (cancelled) return;
        loadedCount++;
        setProgress(Math.floor(((loadedCount + failedCount) / config.frameCount) * 100));
        if (loadedCount === config.frameCount) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (cancelled) return;
        failedCount++;
        setProgress(Math.floor(((loadedCount + failedCount) / config.frameCount) * 100));
        if (failedCount > config.frameCount * 0.5) {
          setError('Failed to load image sequence');
        }
        if (loadedCount + failedCount === config.frameCount && loadedCount > 0) {
          setIsLoaded(true);
        }
      };

      preloadedImages[index] = img;
    };

    for (let i = 0; i < config.frameCount; i++) {
      loadImage(i);
    }

    setImages(preloadedImages);

    return () => {
      cancelled = true;
    };
  }, [config]);

  return { images, progress, isLoaded, error };
};
