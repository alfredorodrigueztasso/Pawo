# Architecture Decision Records (ADRs)

This folder contains decisions about the architecture and design of Pawo.

## What is an ADR?

An Architecture Decision Record (ADR) documents a significant architectural decision made during development. It captures:
- **What** we decided
- **Why** we made that choice
- **What alternatives** we considered
- **Trade-offs** we accepted

ADRs are not "we fixed a bug" — they're "we decided to use technology X instead of Y because Z".

## When to Write an ADR

Write an ADR when:
- Choosing a new framework or library
- Deciding on a major architectural pattern
- Making a decision with long-term consequences
- Rejecting an alternative for a good reason

Don't write an ADR for:
- Bug fixes
- Small features
- Naming decisions
- Temporary workarounds

## ADR Format

File name: `NNN-short-title.md` (e.g., `001-use-orion-ds.md`, `002-supabase-auth.md`)

```markdown
# NNN. Short Title

**Date:** YYYY-MM-DD
**Status:** Accepted | Proposed | Superseded | Deprecated
**Deciders:** @names

## Context

Why did we need to make this decision? What problem were we solving?

## Decision

What did we decide?

## Rationale

Why this decision? What were the key factors?

## Alternatives Considered

### Option A: Technology/Pattern A
- Pros: ...
- Cons: ...

### Option B: Technology/Pattern B
- Pros: ...
- Cons: ...

### Why not Option A?
Explain why we rejected this choice.

## Consequences

### Positive
- What benefits do we get?

### Negative
- What trade-offs did we accept?

### Neutral
- What else changes?

## Implementation Notes

How do we actually implement this? Code patterns, examples?

## Related Decisions

- ADR-001: Earlier decision this builds on
- ADR-003: Future decision this affects

---

**Proposed by:** Name
**Reviewed by:** Name
**Last updated:** Date
```

## Current ADRs

This folder will contain decisions as the project grows. Currently no ADRs, but planned:

- `001-use-orion-ds.md` — Why Orion DS over other component libraries
- `002-supabase-auth.md` — Why Supabase auth over alternatives
- `003-server-components.md` — Why Next.js Server Components by default
- ... more to come as we make decisions

## How to Create an ADR

1. **Identify the decision** — What architectural choice are we making?
2. **Research alternatives** — What are the viable options?
3. **Draft the ADR** — Use the template above
4. **Share for review** — Get feedback from `/pawo-architect` or tech leads
5. **Make it final** — Update status to "Accepted" and commit
6. **Update ARCHITECTURE.md** — Add a link and reference in the main doc

## Using ADRs in Your Work

When you're building something and wonder "why did we choose X?":
1. Check if there's an ADR about it
2. Read the rationale and alternatives
3. Understand the trade-offs we accepted

When you disagree with a decision:
1. Read the corresponding ADR
2. If you still disagree, propose a superseding ADR
3. Document why we should change approach

## Statuses

- **Proposed** — Decision not yet made, open for discussion
- **Accepted** — Decision made and implemented
- **Superseded** — Better decision made, old one replaced
- **Deprecated** — No longer relevant or no longer used

## Related Documentation

- **[../ARCHITECTURE.md](../ARCHITECTURE.md)** (planned) — Overall system design that builds on these decisions
- **[../CONVENTIONS.md](../CONVENTIONS.md)** (planned) — Patterns that emerge from ADRs
- **[../friction/](../friction/)** — Learnings that inform ADRs

---

**Last updated:** 2026-03-24
**Maintained by:** /pawo-architect skill
