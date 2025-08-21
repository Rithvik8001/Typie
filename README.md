## Typie — Minimal Typing Test (Next.js + Supabase)

Typie is a clean, accessible typing test built with Next.js 15, Tailwind v4, shadcn/ui, and Supabase. It focuses on real-time feedback, distraction-free UI, and a smooth path from mocks to production.

### Features

- Live test: 15/30/45/60/120s, raw/adjusted WPM, accuracy, errors
- Per-char highlighting, backspace handling, anti-paste during run
- Filters: difficulty, tags, and character filters (A–Z, 0–9, symbols)
- Results with KPIs + WPM-over-time chart (Recharts)
- Dashboard with period filters (7d/30d/all), pagination, mini-stats
- Email/password auth via Supabase
- Mobile responsive, keyboard-first, high-contrast design

### Tech

- Next.js 15 (App Router), TypeScript (strict)
- Tailwind CSS v4, shadcn/ui, Recharts
- Supabase (Auth + Postgres)
- pnpm for scripts

### Quickstart

1. Install deps

```bash
pnpm install
```

2. Environment
   Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

3. Dev

```bash
pnpm dev
```

### Project Structure

```
app/
  page.tsx                # Landing
  play/                   # Setup + test UI
  results/                # Results view
  dashboard/              # Auth-only dashboard
  auth/                   # Signup/Signin
components/
  typing/                 # Core typing + dashboard UI
  ui/                     # shadcn/ui components
lib/
  api/                    # ApiPort + Supabase client
  auth/                   # Auth context + adapter
  supabase/               # Supabase client factory
  metrics.ts, time.ts, types.ts
```

### Accessibility & Security

- Visible focus rings; keyboard-first flows
- No dangerouslySetInnerHTML; plain-text snippets
- Client-side validation for auth
- Supabase RLS on attempts; prose-only snippets

### Scripts

```bash
pnpm dev     # start
pnpm build   # build
pnpm start   # run production build
```
