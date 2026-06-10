# Project Overview: You Have Been Reborn Wiki

A high-performance, infinitely scalable, and fully static game Wiki. 
Designed to handle thousands of entities (items, mobs, quests) using a serverless, database-less architecture.

- **Primary Goal**: Deliver a rich, interactive Wiki experience that costs $0 to host.
- **Core Strategy**: Flat JSON files as "database", local File System Access API for editing, and client-side search.

# Technology Stack

- **Framework**: React 18+ with TypeScript.
- **Build Tool**: Vite (configured with relative base paths for `file://` support).
- **Routing**: React Router 6 (HashRouter for static/local compatibility).
- **Data Storage**: Flat JSON files in `/public/data/`.
- **Validation**: Zod (all data validated at runtime).
- **State/Fetching**: TanStack Query (React Query).
- **Search**: Fuse.js (Fuzzy search).
- **Editor Sync**: File System Access API + IndexedDB (to persist folder handles).

# Architecture Rules (CRITICAL)

1. **NO BACKEND**: Never implement server-side logic.
2. **NO DATABASES**: All data must live in `/public/data/*.json`.
3. **FLAT DATA STRUCTURE**: Use one JSON file per category in root of data folder (e.g., `items.json`). No nested category folders.
4. **RELATIVE PATHS**: Use `./` base in Vite and `./data/` in fetches to ensure portability.

# Directory Responsibilities (FSD)

- `src/app/`: Global providers, styles, and router (HashRouter).
- `src/pages/`: Page components (Home, CategoryPage, EntityDetail). 
  - *Note*: AdminPanel is only rendered in DEV mode.
- `src/features/`: Search engine, local editor logic.
- `src/entities/`: Domain schemas (Zod) and types.
- `src/shared/`: 
  - `api/`: `dataService.ts` handles fetch + Zod validation.
  - `ui/`: Reusable UI components (LanguageSwitcher, etc.).
- `public/data/`: JSON storage.
- `public/images/`: Automatically managed assets.

# Data Model & Editor Rules

### Image Management:
- Images are stored in `/public/images/`.
- The Admin Panel can upload images directly to this folder and delete them from disk.
- Paths in JSON should be relative: `/images/filename.png`.

### Local Editor (Admin Panel):
- **Access**: Only available in `npm run dev` at `/#/admin`.
- **Sync**: Requires connecting to the project's root `/public` folder.
- **Persistence**: Folder access is remembered via IndexedDB; needs a one-click re-authorization per session.
- **Workflow**: 
  1. Click "Connect Local Folder".
  2. Edit content or upload images.
  3. Click "Push Changes to Disk" to overwrite JSON files.

# Deployment

- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Hosting**: Compatible with GitHub Pages, Cloudflare Pages, Netlify.
- **Pathing**: Ensure `HashRouter` is used for proper sub-page navigation on static hosts.
