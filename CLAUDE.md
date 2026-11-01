# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 言語

ユーザーとの会話は常に日本語で行うこと。コード内のコメント・識別子は既存の英語慣習に従ってよいが、
チャット上の説明・報告・質問はすべて日本語で書くこと。

## Project

"ALCHEMIST" (`hears`) — a Japanese-language internal SFA (sales-force-automation) tool for managing
client hearing (intake) forms, cases/contracts, and revenue for a web-production business that
specializes in love-hotel websites. Next.js 16 App Router + React 19 + TypeScript, single-page-app
style with Supabase as the only backend (auth + one JSON blob of app state per user).

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config, eslint-config-next core-web-vitals + typescript)
```

There is no test suite/framework configured in this repo.

Required env vars (`.env.local`, not committed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Non-negotiable working rules (from `.cursorrules`)

This repo carries a strict "ALCHEMIST 開発ルール" constitution that overrides default agent behavior:

1. **Zero-Touch Policy** — never touch, "clean up", or refactor code beyond what was explicitly
   requested. No incidental/"while I'm here" changes.
2. **Self-Check Protocol** — before starting work, explicitly verify (and report to the user, in
   Japanese) that you are not about to (a) touch areas outside the request, or (b) delete/break
   existing managed fields or logic.
3. **Commit Proposal** — after each completed feature/fix, state in Japanese what was done, and
   create a git commit for it.

## Architecture

**Single global store, no server API routes.** All application data lives in one Zustand store,
[src/store/useHearsStore.ts](src/store/useHearsStore.ts): `projects`, `cases`, `clients`,
`globalTodos`, `globalFinance`, `globalGenres`. There is no persist middleware and no REST/route
handlers — the store is purely in-memory, and [src/components/auth/AuthProvider.tsx](src/components/auth/AuthProvider.tsx)
is what makes it durable:
- On sign-in it calls `loadFromCloud(userId)`, which reads one row from the Supabase `user_state`
  table (`state` jsonb column) and hydrates the store.
- It subscribes to the store and, on any change to the data fields (not UI-only fields like
  `syncStatus`/`mobileMenuOpen`), debounces 3s then `upsert`s the whole state blob back to
  `user_state`. `syncStatus` (`idle`/`syncing`/`error`) drives the toast in
  [RootWrapper](src/components/layout/RootWrapper.tsx).
- All store mutators follow the same pattern: deep-clone the target record with
  `JSON.parse(JSON.stringify(...))`, run a caller-supplied `updater(clone)` mutator, then set it
  back. IDs are `generateId()` (timestamp36 + random suffix), not UUIDs.

**Two-stage domain model:**
- **Project** (`ProjectData`) — an in-progress hearing/intake form, one of `folder:
  'not-started' | 'in-progress' | 'backup'`. Contains a generic `generalQuestions` Q&A list *and*
  a deeply nested `loveHotel` schema (rooms, pricing, equipment, system/ホテナビ integration,
  access) purpose-built for love-hotel intake. Editing happens full-screen at
  `/editor/[id]` (chrome-less route — `RootWrapper` hides `Sidebar`/`GlobalToolbar` whenever
  `pathname.startsWith('/editor')`).
- **Case** (`CaseData`) — a converted, active client engagement with `finance` (recurring
  `maintenanceFee` for HP/SNS "stock" work vs. one-off `spotFee`/`spotRate` for "spot" genres) and
  its own `todos`. `convertToCase(projectId)` creates a Case from a Project and moves the Project
  to the `backup` folder; it does not delete the Project.
- **Client** (`ClientData`) is a separate, lighter-weight contact record, not directly nested
  under Projects/Cases (linked loosely via `clientId`/`clientName` strings).

**Routing** (`src/app/*`, all client components): `/temple` (status/home), `/clients`,
`/hearing`, `/cases`, `/cases/[id]`, `/editor/[id]` (fullscreen hearing editor), `/finance`,
`/finance/details`, `/todo`, `/settings`. `Sidebar` (`src/components/layout/Sidebar.tsx`) is the
source of truth for the primary nav; it also computes a "revenue rate" meter from
`globalFinance.baseSalary` + 40% of summed Case `maintenanceFee`.

**Export, not import/export API.** [ExportPanel](src/components/ExportPanel.tsx) renders a
Project as Markdown/CSV client-side (CSV via `papaparse`, BOM-prefixed for Excel) and also builds
a canned Japanese prompt for feeding the hearing data into the "Readdy" no-code site builder.
[src/lib/syncService.ts](src/lib/syncService.ts) holds legacy AES-GCM/PBKDF2 decryption used only
for importing old v5 `.alchemist` encrypted backup files via the store's `importData()` action —
don't confuse this with the Supabase sync flow in `AuthProvider`.

**UI stack:** Tailwind v4 + shadcn/ui (`components.json`: style `base-nova`, neutral base,
components in `src/components/ui`), icons from `lucide-react`, charts from `recharts`, animation
from `framer-motion`. Path alias `@/*` → `src/*`. The app is a PWA (`public/manifest.json`,
`public/sw.js`, registered via `PwaRegister`).

Standalone Node scripts at the repo root (`check_images.js`, `process_bmp.js`, `remove_bg.js`) are
one-off image-processing utilities for generating the app's pixel-art icons — not part of the
build/runtime.
