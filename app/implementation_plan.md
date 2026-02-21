
# Amorok Jets Clone - Implementation Blueprint

## 1. Project Overview
This project is a high-end, scrollytelling-focused web application mimicking the luxury experience of the Amorok Jets website. It utilizes cinematic image sequences and smooth scrolling to create an immersive private aviation narrative.

## 2. Core Architecture
- **Frontend**: React 18+ with TypeScript (Vite).
- **Backend / CMS**: Headless WordPress.
  - Fetching: REST API or GraphQL.
  - Image Sequences: Managed via ACF (Advanced Custom Fields).
- **Styling**: Tailwind CSS.
- **Animation**: 
  - `Framer Motion`: UI entrance animations.
  - `Canvas API`: Scrollytelling image sequences.
- **Smooth Scroll**: `@studio-freight/lenis`.

## 3. Data Layer (Headless WP)
- **API Client**: Custom fetcher in `lib/wp.ts`.
- **Content Types**:
  - `Sequences`: Custom Post Type or ACF implementation to hold image URLs for canvas sequences.
  - `Pages`: Standard page content.
- **Optimization**: React Query (TanStack Query) recommended for caching and background updates.

## 4. Component Breakdown

### A. SequenceScroller.tsx
The engine of the site. It uses a sticky container and a canvas. 
- **Logic**:
  1. Map `window.scrollY` (relative to the container) to a value between `0` and `1`.
  2. Multiply progress by `totalFrames` to get the current frame index.
  3. Draw that frame to a high-resolution canvas.
  4. Use "Cover" logic (object-fit equivalent for canvas) to handle all screen resolutions.

### B. SmoothScroll.tsx
A context/wrapper component that initializes Lenis. It's critical for the cinematic feel as standard browser scrolling is too aggressive for image sequences.

### C. UI Sections
- **HeroSection**: Cloud sequence (`/sequence-1/`). Floating typography. High contrast.
- **PlaneSection**: Plane morph sequence (`/sequence-2/`). Technical stats reveal as the plane "assembles" or "morphs" through scroll.
- **GlobeSection**: Uses `globe-loop.mp4`. A high-impact final section with a background video and primary CTA.

## 5. Performance Strategy
- **Image Preloading**: Custom hook `useImagePreloader` (now capable of fetching list from WP).
- **Canvas Rendering**: GPU-accelerated 2D context.
- **Scroll Throttling**: `requestAnimationFrame` for canvas.

## 6. Visual Identity
- **Background**: Deep black (`#050505`).
- **Typography**: `Inter` / `Geist`.
- **Color Accent**: Minimalist luxury.

## 7. Development Checklist
1. [ ] Setup Lenis smooth scroll.
2. [ ] Implement `useImagePreloader` for Sequence 1 and 2.
3. [ ] Build `SequenceScroller` component with Canvas 'cover' logic.
4. [ ] Design `HeroSection` with parallax typography.
5. [ ] Design `PlaneSection` with data-reveal overlays.
6. [ ] Implement `GlobeSection` with background video loop.
7. [ ] Add global transitions and entrance animations.
8. [ ] Optimize for mobile (Consider reducing frame count or using static fallbacks if needed).
