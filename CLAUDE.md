# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (runs prisma generate + next dev --turbopack)
npm run build        # Production build (runs prisma generate + next build)
npm run lint         # ESLint
npm run test         # Run unit tests with Vitest (single pass)
npm run test:watch   # Vitest in watch mode

# Local Supabase (Docker required)
npm run db:start     # Start local Supabase instance
npm run db:stop      # Stop local Supabase
npm run db:reset     # Reset DB and re-run all migrations + seed
npm run db:migrate   # Create a new migration file
npm run db:up        # Apply pending migrations locally
```

Run a single test file: `npx vitest run lib/bracket.test.ts`

## Architecture

**MusiKlash** is a music gaming platform built on Next.js (App Router) + Supabase + Prisma.

### Stack
- **Next.js** (see AGENTS.md — this version has breaking changes vs training data)
- **React 19** with React Compiler enabled in production
- **Supabase** — PostgreSQL database, Auth (email/password + guest flow), Realtime channels
- **Prisma** ORM with `@prisma/adapter-pg` (native pg pooling); schema in `prisma/schema.prisma`
- **Tailwind CSS v4** (PostCSS only — no CLI)
- **Zod** + **react-hook-form** for form validation throughout

### Key Patterns

**Server/client split**: Pages (`page.tsx`) are server components by default. Interactive logic lives in sibling `*Client.tsx` files marked `"use client"`. Mutations use Server Actions defined in collocated `actions.ts` files.

**No global state library**: Client components use local React hooks (`useState`, `useCallback`, etc.). Cross-tab state (e.g. audio volume) uses `useSyncExternalStore`.

**Multiplayer**: Supabase Realtime broadcast channels handle live sync for Blindtest and BattleFeat rooms. See `BlindtestRoomClient.tsx` and `BattleFeatRoomClient.tsx` for the pattern.

**Auth**: `@supabase/ssr` handles server-side session refresh via `lib/supabase/`. Guests get a `mk_guest_id` UUID cookie; their data auto-migrates on account creation.

**i18n**: Custom implementation in `lib/i18n/`. Locale detected from Vercel IP header or `Accept-Language`. French is default. Only used in server components via `getI18n()`.

**Deezer integration**: All Deezer API calls are proxied through `app/api/deezer/` route handlers to avoid exposing the external API to the client directly.

### Feature Modules

| Path | Feature |
|------|---------|
| `app/bracket/` | Tournament-style head-to-head voting |
| `app/tierlist/` | Drag-and-drop track ranking (`@dnd-kit`) |
| `app/blindtest/` | Solo & multiplayer listening quizzes |
| `app/battle-feat/` | Rap artist collaboration path game |
| `app/create-*/` | Creation flows for each game mode |
| `app/explore/` | Public content discovery |
| `app/my-brackets/` | Personal library |
| `app/api/deezer/` | Deezer API proxy routes |

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # optional, for admin/seed operations
```

Local Supabase defaults: URL `http://127.0.0.1:54321`, DB port `54322`.

### Database

Prisma config: `prisma.config.ts`. Migrations in both `prisma/migrations/` and `supabase/migrations/` — Supabase CLI manages local dev, Prisma manages schema. After schema changes: `npx prisma generate` (already wired into `dev` and `build` scripts).
