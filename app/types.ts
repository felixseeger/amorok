
export interface SequenceConfig {
  path: string;
  frameCount: number;
  extension: string;
  prefix: string;
  startIndex?: number; // Optional, defaults to 0
}

export interface PreloadedImages {
  [key: string]: HTMLImageElement[];
}
