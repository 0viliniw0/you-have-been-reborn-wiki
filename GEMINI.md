# Project Overview: You Have Been Reborn Wiki

A high-performance, infinitely scalable, and fully static game Wiki. 
The project is designed to handle tens of thousands of game entities (items, mobs, quests) using a serverless, database-less architecture.

- **Primary Goal**: Deliver a rich, interactive Wiki experience that costs $0 to host.
- **Hosting Target**: GitHub Pages, Cloudflare Pages, Netlify (Static only).
- **Core Strategy**: Use JSON files as the "database" and a client-side search index for navigation.

# Technology Stack

- **Framework**: React 18+ with TypeScript (Strict Mode).
- **Build Tool**: Vite.
- **Data Storage**: Flat JSON files in `/public/data/`.
- **Validation**: Zod (all data must be validated at runtime).
- **Routing**: React Router 6 (Client-side routing with clean URLs).
- **State/Fetching**: TanStack Query (React Query) for efficient JSON loading and caching.
- **Search**: Fuse.js (Fuzzy search with pre-built or dynamic indexing).
- **Styling**: Tailwind CSS.

# Architecture Rules (CRITICAL)

**All AI agents MUST adhere to these mandates. NO EXCEPTIONS.**

1. **NO BACKEND**: Never suggest or implement Node.js servers, Express, Go, Python, or any server-side logic.
2. **NO DATABASES**: Never use SQL (Postgres, MySQL), NoSQL (MongoDB), or Managed DBs (Firebase, Supabase, Airtable).
3. **NO EXTERNAL APIS**: Do not rely on REST or GraphQL APIs that require a running server.
4. **STATIC ONLY**: The final build must be a folder of HTML/JS/CSS/JSON that works via `file://` or a basic static web server.
5. **JSON AS SOURCE OF TRUTH**: All game data must live in the repository as JSON files.

# Directory Responsibilities (Feature-Sliced Design)

This project follows **Feature-Sliced Design (FSD)**. Adhere to this structure:

- `src/app/`: App-wide configuration: providers, global styles, router setup.
- `src/pages/`: Composition layer. Pages are built by combining widgets and features.
- `src/widgets/`: Large, self-contained UI units (e.g., `Header`, `Sidebar`, `EntityDetailsCard`).
- `src/features/`: User actions and logic (e.g., `SearchEntities`, `LocalAdminEditing`, `ExportData`).
- `src/entities/`: Domain-specific logic and UI (e.g., `Item`, `Mob`, `NPC`). Includes schemas and simple cards.
- `src/shared/`: Generic, reusable code.
  - `shared/ui/`: UI Kit (Buttons, Inputs, Modals).
  - `shared/api/`: The `dataService` for fetching JSON files.
  - `shared/types/`: Global TypeScript interfaces and Zod schemas.
  - `shared/lib/`: Utils and helper functions.
- `public/data/`: The static database, partitioned by category and batch.

# Data Model Rules

### Naming Conventions:
- **`id`**: Unique UUID or unique string.
- **`slug`**: URL-friendly name (e.g., `iron-sword`). Used for routing.
- **`name`**: Display title of the entity.
- **`description`**: Markdown-ready string.

### Relationships:
- Use **ID-based references**. An Item references a Recipe ID. A Mob references a Location ID.
- Relationships must be resolved on the client side using the loaded entity collection.

# Coding Standards

- **Strict TypeScript**: No `any`. Use interfaces for all data structures.
- **Functional Components**: Use hooks and functional patterns only.
- **SOLID & DRY**: Encapsulate logic in hooks; keep components focused.
- **Zod Validation**: Always validate JSON data before use to prevent "undefined" crashes.

# Performance Rules

- **Lazy Loading**: Use `React.lazy` for pages.
- **Batching**: Never load one giant `data.json`. Use partitioned files (e.g., `swords.json`, `armor.json`).
- **Discovery**: Use `registry.json` to allow the app to "discover" data files without hardcoding paths.
- **Memoization**: Use `useMemo` for heavy data filtering or relationship resolution.

# Search System Rules

- **Search Index**: Do not iterate over 10,000 items on every keystroke.
- **Fuse.js**: Use Fuse.js for fuzzy matching.
- **Persistence**: For large datasets, the search index should be generated at build time or cached in an optimized format.

# Admin Panel Rules (Local Editor)

- **Browser-Only**: The admin panel exists only for the developer/editor.
- **No Auth**: Since it's local, no login system is needed.
- **Persistence**: Store drafts in `localStorage` or `IndexedDB`.
- **Sync**: Changes are saved by **Exporting to JSON** and overwriting files in the `/public/data/` folder manually.

# Forbidden Changes

**NEVER ATTEMPT TO:**
- Add a `server/` directory.
- Add `docker-compose.yml` with a database.
- Use `fetch()` to a non-local URL (except for external assets/images).
- Suggest "scaling by moving to a real database." Scaling is achieved by better JSON partitioning.

# Checklist For AI Agents

Before providing a solution, verify:
1. [ ] Does this require a server? (If yes, REJECT).
2. [ ] Does this require a database? (If yes, REJECT).
3. [ ] Does this break the static build? (If yes, REJECT).
4. [ ] Does this follow Feature-Sliced Design?
5. [ ] Is the data typed with TypeScript and validated with Zod?
