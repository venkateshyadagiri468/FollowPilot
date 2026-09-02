# FollowPilot — AI-Assisted Sales Follow-up Monolithic Engine

FollowPilot is a B2B sales follow-up workspace that continuously turns lead activity signals into prioritized, contextual follow-up recommendations.

## Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript (Strict Mode)
- **Database & ORM**: PostgreSQL & Drizzle ORM
- **Authentication**: Clerk (`@clerk/nextjs`) - Multi-tenant organization authentication
- **Styling**: Vanilla CSS / Tailwind CSS (Obsidian Dark Visual Identity System)
- **Integrations**: OpenAI (Lead Intent Analysis), Resend (Email Delivery), Stripe (Subscription Billing)
- **Background Jobs**: Trigger.dev Task Abstraction

## Phase Status

- ✅ **Phase 1**: Product Foundation & Architecture Core
- ✅ **Phase 2**: Production Architecture Hardening & Security Isolation
- ✅ **Phase 3**: Authentication & Organization Management (Phase 3 is complete and locked. All Phase 3 acceptance criteria and automated verification currently pass.)
- ✅ **Phase 4**: Core Lead Management & CSV Ingestion (Lead schema, status state machine rules, CSV import engine with deduplication strategies, activity timeline auditing, Obsidian dark UI)


## Quick Start & Setup

### 1. Environment Setup
Copy `.env.example` to `.env.local` and populate required credentials:
```bash
cp .env.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Seeding
Run schema migrations and seed the database with initial demo leads and organizations:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## Testing & Quality Assurance

- **Type Check**: `npx tsc --noEmit`
- **Unit & Integration Tests**: `npm run test`
- **E2E Smoke Tests**: `npm run test:e2e`
