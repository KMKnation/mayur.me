# 3D Portfolio Website (Mayur Kanojiya)

This repository contains Mayur Kanojiya's portfolio with a CMS-driven architecture (Supabase + React/Vite). The existing 3D/animation style is preserved while content, navigation, blog, and dedicated showcase pages are fully dynamic through the admin panel.

## Stack

- React + TypeScript + Vite
- GSAP + ScrollSmoother
- Three.js + React Three Fiber
- React Icons + React Fast Marquee
- Supabase (Auth, Postgres, Storage via REST)

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## CMS + Admin Setup

1. Create a Supabase project.
2. Run SQL in order:
- `supabase/schema.sql`
- `supabase/seed.sql`
3. Configure Google provider in Supabase Auth.
4. Add environment variables in `.env`:

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

5. Start app and use:
- `/admin/login` for Google sign-in
- `/admin` for CMS dashboard

Super admin is seeded as:
- `kanojiyamayur@gmail.com`

## Dynamic Routes

- `/` Home
- `/work-showcase` Work dedicated page
- `/patent-showcase` Patent dedicated page
- `/blog` Blog listing
- `/blog/:slug` Blog detail page
- `/admin/login` Admin login
- `/admin` Admin CMS

## CMS Scope

- Site/global settings, navigation, section visibility/order
- Homepage sections (hero, about, what-I-do, career, contact)
- Work and patent items with `is_view_more_tile`, ordering, visibility, animation presets
- Tech stack items and animation controls
- Blog posts/categories/tags with draft/publish workflow
- Media library metadata and storage uploads
- Admin users/invites and revision history/restore

## Credits

Base UI source inspiration and structure adapted from:

- https://github.com/akashrmalhotra/3d-portfolio

(Used under MIT license.)
