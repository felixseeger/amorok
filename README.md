# Amorok Website

Frontend project for the Amorok website.

## Project Structure

- `app/` – Vite + React application
- `config/` – deployment/config helper files
- `docs/` – project notes and plans

## Local Development

From repository root:

```bash
npm --prefix app install
npm --prefix app run dev
```

## Production Build

```bash
npm --prefix app run build
```

Build output is generated in `app/build`.

## Vercel Deployment

The repository is configured for Vercel with root-level `vercel.json`.

- Build command: `npm --prefix app run build`
- Output directory: `app/build`
- SPA rewrites are enabled to route all paths to `index.html`.

## Environment Variables

Set in Vercel and/or local `.env.local` (inside `app/`):

- `VITE_WP_API_URL` (must be HTTPS in production)
