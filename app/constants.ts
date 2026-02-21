
import { SequenceConfig } from './types';

export const HERO_SEQUENCE: SequenceConfig = {
  path: '/sequence-1/',
  frameCount: 83,
  extension: 'jpg',
  prefix: 'ezgif-frame-',
  startIndex: 1
};

/** Sequence 2 (plane): frames 80–120 only (41 frames) after filename change */
export const PLANE_SEQUENCE: SequenceConfig = {
  path: '/sequence-2/',
  frameCount: 41,
  extension: 'jpg',
  prefix: 'ezgif-frame-',
  startIndex: 80
};

export const INTERIOR_SEQUENCE: SequenceConfig = {
  path: '/sequence-3/',
  frameCount: 120,
  extension: 'jpg',
  prefix: 'ezgif-frame-',
  startIndex: 1
};

export const COLORS = {
  background: '#050505',
  text: '#FFFFFF',
  accent: '#D4AF37' // Luxury gold accent
};

export const LUXURY_COPY = {
  hero_title: "TRANSCEND THE ORDINARY",
  hero_subtitle: "The ultimate expression of private flight.",
  mission_title: "A Legacy of Precision",
  mission_text: "Engineered for those who demand excellence without compromise. Amorok bridges the gap between peak performance and unparalleled luxury.",
  interior_title: "Sanctuary in the Sky",
  interior_text: "Hand-stitched leather. Whisper-quiet acoustics. A cabin designed not just for travel, but for living.",
  fleet_title: "THE AMOROK FLEET",
  fleet_text: "Where every detail is crafted to evoke a sense of weightless elegance.",
};
