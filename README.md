# ripperdeck

A deckbuilder web app for the Cyberpunk 2077 Trading Card Game by WeirdCo/CDPR. Think Moxfield or Dreamborn.ink, but for Night City.

**https://ripperdeck.gg**

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + Storage)
- **Recharts** for data visualization
- Deployed on **Vercel**

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy the environment variables template:

```bash
cp .env.local.example .env.local
```

3. (Optional) Set up Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Update `.env.local` with your Supabase URL and anon key

   > Phase 1 works entirely offline with local JSON seed data and localStorage for deck persistence. Supabase is not required to run the app.

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/                      # Next.js App Router pages
    cards/                  # Card database browser + individual card pages (SSG)
    decks/                  # Deck list, builder, and editor pages
  components/
    ui/                     # Reusable UI primitives (buttons, filters, effects)
    cards/                  # Card display and grid components
    deck-builder/           # Deck editor, stats, legend picker
    layout/                 # Header and footer
  lib/
    cards/                  # Card types and deck validation logic
    hooks/                  # React hooks (useCards, useLocalDecks)
    supabase/               # Supabase client setup
    utils.ts                # Utility functions and constants
  data/
    cards.json              # Seed card data (~20 cards)
    cards.ts                # Typed card data accessor
supabase/
  migrations/               # SQL schema migrations
```

## Features

- **Card Database** — Browse and filter all cards by type, color, cost, rarity, and keywords
- **Deck Builder** — 3-panel editor with Legend picker, card browser, and deck list
- **Live Validation** — Real-time deck validation (card count, RAM budget, copy limits)
- **Deck Analytics** — Eddie cost curve, type distribution, color breakdown, sell tag ratio
- **SEO** — Individual card pages are statically generated for search engine indexing
- **Cloud Sync** — Decks save to Supabase when logged in, localStorage fallback when offline

## Deck Rules

- Select exactly 3 Legends (each provides RAM for their color)
- Add 40-50 cards to your deck
- Maximum 3 copies of any single card
- Each card's RAM cost must be covered by your Legends' RAM budget for that color

## Roadmap

- **Phase 1** (done): Core deckbuilder with local data
- **Phase 2** (done): Auth (Discord/Google/GitHub OAuth), cloud deck saving, migration banner
- **Phase 3**: Deck comments, upvotes, metagame analytics
