# Amorok Frontend (Vite + React)

## Requirements

- Node.js 18+
- npm

If you use `nvm` or `fnm`, run `nvm use` / `fnm use` from repo root first.

## Run locally

From `app/`:

```bash
npm install
npm run dev
```

Or from repository root:

```bash
npm --prefix app install
npm --prefix app run dev
```

## Build

```bash
npm run build
```

Build artifacts are written to `build/`.

## Preview production build

```bash
npm run preview
```

## Environment

Create `app/.env.local` with at least:

```dotenv
VITE_WP_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
```

Important: use `https://` for production to avoid mixed-content blocks.

## Deploy

Project is configured for Vercel via repository root `vercel.json`.

- Build command: `npm --prefix app run build`
- Output directory: `app/build`
- SPA rewrites: all routes -> `index.html`
