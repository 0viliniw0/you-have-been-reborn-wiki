# Project Overview: You Have Been Reborn Wiki

A high-performance, infinitely scalable, and fully static game Wiki. 
Designed to handle thousands of entities (items, mobs, quests) using a serverless, database-less architecture.

- **Primary Goal**: Deliver a rich, interactive Wiki experience that costs $0 to host.
- **Core Strategy**: Flat JSON files as "database", local File System Access API for editing, and client-side search.

# Technology Stack

- **Framework**: React 18+ with TypeScript (Strict mode).
- **Build Tool**: Vite (configured with `./` base for `file://` and static host compatibility).
- **Routing**: React Router 6 (HashRouter for seamless static navigation).
- **Data Storage**: Flat JSON files in `/public/data/` (one file per category).
- **Validation**: Zod (runtime schema validation for all JSON data).
- **State/Fetching**: TanStack Query (React Query) for efficient caching.
- **Search**: Fuse.js (Client-side fuzzy search).
- **Editor Sync**: File System Access API + IndexedDB (persists folder handles for a seamless dev experience).

# Architecture Rules (CRITICAL)

1. **NO BACKEND**: Zero server-side logic. All logic is client-side.
2. **NO DATABASES**: All data lives in `/public/data/*.json`.
3. **FLAT DATA STRUCTURE**: Strictly one JSON file per category in the root of the data folder. No nested folders.
4. **FEATURE-SLICED DESIGN (FSD)**: Adhere strictly to the layers (`app`, `pages`, `widgets`, `features`, `entities`, `shared`).
5. **ASSET MANAGEMENT**: All static assets (images, svgs) must live in `/public/`. Use `/public/assets/` for app icons and `/public/images/` for game entities.

# Directory Responsibilities (FSD)

- **`src/app/`**: Global configuration (providers, styles, router).
- **`src/pages/`**: Composition layer for routes. 
  - `AdminPanel.tsx` is protected by a permission overlay and only accessible in DEV mode.
- **`src/widgets/`**: Complex UI units. 
  - `Header/`: Includes navigation and `LanguageSwitcher`.
- **`src/features/`**: User actions (Search logic, Local Admin sync).
- **`src/entities/`**: Domain-specific logic. 
  - `Entity/`: Contains common `EntityCard` used for lists and search results.
- **`src/shared/`**: Reusable infrastructure.
  - `api/`: `dataService.ts` (JSON fetching + Zod validation).
  - `types/`: Global interfaces and Zod schemas.
  - `ui/`: Generic UI components (Buttons, Switchers).
  - `lib/`: Utilities (i18n configuration).

# Local Content Editor (Admin Panel)

- **Access**: Only available during `npm run dev` at `/#/admin`.
- **Authorization**: Uses a "Permission Overlay". Access is blocked until the local `/public` folder is connected and write permissions are granted.
- **Image Handling**: Supports direct file uploads. Uploaded images are physically saved to `/public/images/` and paths are automatically mapped.
- **Persistence**: Folder handles are saved in IndexedDB. Users only need to "Unlock" the session once per browser restart.
- **Data Sync**: "Push Changes to Disk" merges drafts into the corresponding JSON files in `/public/data/`.

# Deployment & Usage

- **Environment**: Optimized for static hosting (GitHub Pages, Cloudflare, etc.).
- **Build**: `npm run build` produces a portable `dist` folder.
- **Local Preview**: Use `npm run preview`. Avoid opening `index.html` via `file://` directly due to CORS; use a local static server.
