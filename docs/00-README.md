# Pawo Technical Documentation

This directory contains all technical documentation for the Pawo project.

## Quick Navigation

**Start here:** [INDEX.md](INDEX.md) — Central navigation guide for all documentation

## Documentation by Category

### Getting Started (Read These First)
- **[INDEX.md](INDEX.md)** — Navigation and overview
- **[../README.md](../README.md)** — Project intro, quick start, features
- **[../PRODUCT_VISION.md](../PRODUCT_VISION.md)** — Product roadmap and vision

### Technical Documentation (In Progress)
- **SETUP.md** (planned) — Detailed local development setup
- **ARCHITECTURE.md** (planned) — System design, patterns, folder structure
- **DATA_MODEL.md** (planned) — Database schema, relationships, indexes
- **CONVENTIONS.md** (planned) — Code style, naming, imports, commit format
- **API.md** (planned) — Server Actions, inputs, outputs, error handling
- **COMPONENTS.md** (planned) — Orion DS components we use and patterns

### Testing & Quality
- **[test-checklist.md](test-checklist.md)** — Full QA testing matrix
- **[../BUGS_ENCONTRADOS.md](../BUGS_ENCONTRADOS.md)** — Known bugs and fixes

### Architecture Decisions (ADRs)
- **[adr/](adr/)** — Architecture Decision Records
  - `001-*.md` (planned)
  - `002-*.md` (planned)

### Learning & Friction Logs
- **[friction/](friction/)** — Framework learnings and barriers
  - **[friction/orion-5-3-0.md](friction/orion-5-3-0.md)** — Orion DS 5.3.0 component analysis
  - **[friction/orion-next13-app-router.md](friction/orion-next13-app-router.md)** — Next.js 13+ App Router learnings

## How to Use This Documentation

### I'm setting up for the first time
1. Read [../README.md](../README.md) for quick start
2. Follow the 3 setup steps (Supabase, migrations, run locally)
3. Check [test-checklist.md](test-checklist.md) to verify everything works

### I'm building a new feature
1. Check [../NEXT_STEPS.md](../NEXT_STEPS.md) for what to build
2. Use `/pawo-pm` skill to write a detailed spec
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) (when complete) for patterns
4. Check [CONVENTIONS.md](CONVENTIONS.md) (when complete) for code style
5. Use `/pawo-lead` skill for code review

### I need to understand the database
1. Check [DATA_MODEL.md](DATA_MODEL.md) (when complete) for full schema
2. Look at `../supabase/migrations/` for SQL migrations in order
3. Read inline comments in migration files
4. Use `/pawo-backend` skill for specific questions

### I found a bug
1. Document it in [../BUGS_ENCONTRADOS.md](../BUGS_ENCONTRADOS.md)
2. Mark priority (P1=critical, P2=medium, P3=low)
3. If you fix it, move to "✅ Bugs Resueltos" section
4. If pending, keep in "❌ Bugs Pendientes" section

### I'm debugging UI/Orion issues
1. Check [friction/orion-5-3-0.md](friction/orion-5-3-0.md) for component barriers
2. Check [friction/orion-next13-app-router.md](friction/orion-next13-app-router.md) for framework issues
3. Use `/pawo-ui` skill for component help

### I need to make an architectural decision
1. Check existing [ARCHITECTURE.md](ARCHITECTURE.md) (when complete)
2. Read relevant ADRs in [adr/](adr/) folder
3. Use `/pawo-architect` skill for major decisions
4. Document your decision in a new ADR file: `adr/NNN-short-title.md`

## Documentation Standards

### Writing Style
- **Clear & concise:** One idea per section, no fluff
- **Action-oriented:** Tell people what to do, not just what exists
- **Examples included:** Show code samples for every concept
- **Links everywhere:** Cross-reference related docs

### File Naming
- **Root docs:** `UPPERCASE_WITH_UNDERSCORES.md` (e.g., PRODUCT_VISION.md)
- **Inside docs/:** `lowercase-with-dashes.md` (e.g., data-model.md)
- **ADRs:** `NNN-short-title.md` (e.g., 001-use-orion-ds.md)
- **Friction logs:** `framework-topic.md` (e.g., orion-5-3-0.md)

### Language Convention
- **UI/Copy:** Español (what users see)
- **Code:** English (variables, functions, types)
- **Docs:** Español (technical explanations)
- **Code comments:** Español for WHY, English for TODO tags

### When to Update Docs

| Change | Update These Docs |
|--------|-------------------|
| New feature implemented | NEXT_STEPS.md, ARCHITECTURE.md |
| Database schema changes | DATA_MODEL.md, ARCHITECTURE.md |
| New dependency added | README.md, ARCHITECTURE.md |
| Bug found | BUGS_ENCONTRADOS.md |
| Bug fixed | BUGS_ENCONTRADOS.md (move section) |
| Architectural decision | adr/NNN-*.md + ARCHITECTURE.md |
| New code pattern | CONVENTIONS.md, ARCHITECTURE.md |
| Framework learning | friction/*.md |

## Current Status

### Completed
- INDEX.md — Navigation guide
- friction/orion-5-3-0.md — Component analysis
- friction/orion-next13-app-router.md — Framework learnings
- test-checklist.md — Testing matrix

### In Progress
- SETUP.md — Local development guide
- ARCHITECTURE.md — System design and patterns

### Planned
- DATA_MODEL.md — Database schema reference
- CONVENTIONS.md — Code style and naming
- API.md — Server Actions reference
- COMPONENTS.md — Orion DS usage guide
- adr/ folder — Architecture decision records

## Who Maintains What

| Role | Docs |
|------|------|
| `/pawo-docs` | Overall structure, INDEX, standards |
| `/pawo-architect` | ARCHITECTURE.md, adr/ folder |
| `/pawo-pm` | Feature specs (linked from NEXT_STEPS.md) |
| `/pawo-backend` | DATA_MODEL.md, API.md |
| `/pawo-ui` | COMPONENTS.md |
| `/pawo-qa` | test-checklist.md, bug reports |
| Any contributor | Keep docs in sync with changes |

## Tips for Developers

### Search documentation
```bash
# Find all mentions of "balance"
grep -r "balance" /Users/alfredo/Documents/pawo/docs/

# Find all TODOs in docs
grep -r "TODO" /Users/alfredo/Documents/pawo/docs/

# Find all planned docs
grep -r "planned" /Users/alfredo/Documents/pawo/docs/
```

### Keep docs fresh
- When you change code, update relevant docs
- When you learn something new, add to friction/ folder
- When you make a big decision, write an ADR
- When you find a pattern, add to CONVENTIONS.md

### Use skills as co-authors
- Let `/pawo-architect` help write ARCHITECTURE.md
- Let `/pawo-pm` write feature specs
- Let `/pawo-qa` help write test-checklist.md
- Let `/pawo-docs` maintain structure

---

**Last updated:** 2026-03-24
**Maintained by:** /pawo-docs skill
