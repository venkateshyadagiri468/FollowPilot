# FollowPilot — AI Intelligence Engine Architecture Documentation

This document explains the technical architecture, data pipeline contracts, security controls, and operational mechanics of the **FollowPilot AI Intelligence Engine (Phase 6)**.

---

## 1. Architectural Philosophy

FollowPilot's AI Intelligence Engine treats LLMs as **intelligence components**, not authoritative sources of truth.
- **PostgreSQL / Drizzle ORM** remains the authoritative source of truth.
- **Deterministic Application Rules** override AI recommendations when business state invariants dictate (e.g. `WON`, `LOST`, `BOUNCED` leads).
- **Vendor Boundary**: Raw OpenAI SDK calls are isolated to `src/integrations/openai/`. The core AI analysis domain (`src/features/ai-analysis/`) interacts purely through typed integration boundaries.

---

## 2. Pipeline Execution Flow

```text
Database Entities (Lead, Activities, Conversations)
        ↓
Context Builder (Chronological sorting, token capping <= 2,500, prompt injection defense)
        ↓
AI Input Schema (Zod contract)
        ↓
OpenAI Integration (gpt-4o-mini default, 5,000ms timeout, 1 retry, Structured Output)
        ↓
Zod Output Validation (AIAnalysisOutputSchema)
        ↓
Business Safety Rules Engine (Deterministic overrides)
        ↓
Persistence & Usage Accounting (`ai_analyses` table + monthly quota tracking)
        ↓
Sales Workspace UI (Action Center & Split Drawer)
```

---

## 3. Core Modules & Responsibilities

- `src/features/ai-analysis/schemas.ts`: Zod schemas for input payload, LLM output, and domain entities. Bounds confidence ranges to `[0.0, 1.0]`.
- `src/features/ai-analysis/context-builder.ts`: Enforces token/size limits, orders activities recency, and wraps prospect text in `<prospect_untrusted_input>` defensive tags.
- `src/features/ai-analysis/prompts.ts`: Versioned prompt registry (`v1.0.0-lead-intent`).
- `src/features/ai-analysis/recommendations.ts`: Business safety floor overriding AI suggestions when lead status is `WON`, `LOST`, or `DORMANT`.
- `src/features/ai-analysis/service.ts`: Central `analyzeLead` orchestrator with SHA-256 fingerprint caching, monthly tier quota checks, and deterministic heuristic fallback.
- `src/features/ai-analysis/repository.ts`: Persistence repository for `ai_analyses` data store.
- `src/integrations/openai/client.ts`: Isolated OpenAI SDK wrapper supporting Structured Outputs, 5,000ms `AbortController` timeout, and retry backoff.
- `tests/ai-evals/eval-runner.test.ts`: Evaluation benchmark suite testing High/Medium/Low/Negative/Injection fixtures in CI.

---

## 4. Security & Prompt Injection Defense

1. **Defensive Delimiters**: All untrusted prospect text (email bodies, notes, messages) is stripped of control characters and wrapped in `<prospect_untrusted_input>` XML tags.
2. **System Guardrails**: System prompts instruct the LLM that text inside `<prospect_untrusted_input>` is **data to analyze only**, never system commands.
3. **No Autonomous Actions**: Phase 6 provides intelligence only. The LLM cannot send emails, delete records, or modify organization settings.

---

## 5. Fallback & Resiliency

If OpenAI is unconfigured, times out (>5,000ms), returns invalid JSON, or experiences API downtime:
1. The circuit breaker catches the exception.
2. The engine automatically engages the deterministic Heuristic Scoring Engine (`score-engine.ts`).
3. The analysis entity is saved with `isFallback: true` and status `COMPLETED`.
4. FollowPilot remains 100% operational without failing.
