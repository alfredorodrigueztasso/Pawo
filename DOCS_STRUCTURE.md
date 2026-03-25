# Pawo Documentation Structure

Quick reference for where everything is and what it contains.

## The Map

```
pawo/
├── README.md                    ← START HERE: What is Pawo, quick start
├── PRODUCT_VISION.md            ← Product roadmap and completed features
├── NEXT_STEPS.md                ← What to build next, testing checklist
├── BUGS_ENCONTRADOS.md          ← Known bugs, resolved and pending
│
└── docs/
    ├── 00-README.md             ← Welcome to technical docs
    ├── INDEX.md                 ← Central navigation guide (THE MAP)
    │
    ├── test-checklist.md        ← Full QA testing matrix
    │
    ├── friction/                ← What didn't work (barriers we found)
    │   ├── README.md            ← How to use friction logs
    │   ├── orion-5-3-0.md       ← Orion DS component analysis
    │   └── orion-next13-app-router.md ← Next.js App Router learnings
    │
    └── adr/                     ← Architecture decisions
        ├── README.md            ← How to write ADRs
        └── (planned: 001-, 002-, etc.)
```

## Quick Reference by Purpose

### I'm new to the project
1. **README.md** — What, why, quick start (5 min read)
2. **PRODUCT_VISION.md** — What we're building (10 min read)
3. **Run:** `npm install && npm run dev`
4. **Verify:** Follow test-checklist.md

### I'm implementing a feature
1. **NEXT_STEPS.md** — What to build
2. Use `/pawo-pm` → write spec
3. **docs/00-README.md** → links to ARCHITECTURE, CONVENTIONS
4. Use `/pawo-lead` → review code

### I found a bug
1. **BUGS_ENCONTRADOS.md** → Add to "❌ Bugs Pendientes" section
2. Note: Priority (P1/P2/P3), description, steps to reproduce
3. Fix it
4. Move to "✅ Bugs Resueltos" section

### I'm debugging UI issues
1. **docs/friction/orion-5-3-0.md** → Component barriers
2. **docs/friction/orion-next13-app-router.md** → Framework issues
3. Use `/pawo-ui` → component help

### I'm making a big architectural decision
1. **docs/adr/README.md** → How to write an ADR
2. Draft ADR in **docs/adr/NNN-title.md**
3. Get feedback from `/pawo-architect`
4. Update **docs/ARCHITECTURE.md** with new pattern

### I need to understand the database
1. **NEXT_STEPS.md** → "Database migrations" section
2. **docs/friction/\*.md** → What worked/didn't work
3. `supabase/migrations/` → SQL migrations in chronological order
4. Use `/pawo-backend` → database questions

## Document Purposes at a Glance

| Document | Purpose | Read When |
|----------|---------|-----------|
| README.md | Project intro & quick start | First time here |
| PRODUCT_VISION.md | What we're building & why | Understanding features |
| NEXT_STEPS.md | Roadmap & testing checklist | Planning work |
| BUGS_ENCONTRADOS.md | Known bugs & fixes | Debugging issues |
| docs/INDEX.md | Navigation hub | Looking for something |
| docs/00-README.md | Tech docs welcome | Getting started with dev |
| docs/friction/ | Learnings from barriers | Understanding tradeoffs |
| docs/adr/ | Architecture decisions | Understanding major choices |
| test-checklist.md | Complete QA matrix | Testing features |

## Update Rules

**Keep these always in sync with code:**
- README.md — Stack versions, setup steps
- PRODUCT_VISION.md — Completed features
- NEXT_STEPS.md — What's implemented vs planned
- BUGS_ENCONTRADOS.md — Fixed and pending bugs

**Build gradually:**
- docs/ARCHITECTURE.md (planned)
- docs/DATA_MODEL.md (planned)
- docs/CONVENTIONS.md (planned)
- docs/adr/ folder

**Update as you learn:**
- docs/friction/ — New barriers discovered
- docs/test-checklist.md — New test scenarios

## File Statistics

```
Total markdown files in docs/: 7
├── Main navigation: 2 (INDEX.md, 00-README.md)
├── Content: 3 (test-checklist.md + friction/ + adr/)
└── Guides: 2 (friction/README.md + adr/README.md)

Root level docs: 4
├── README.md (product overview)
├── PRODUCT_VISION.md (roadmap)
├── NEXT_STEPS.md (todo list)
└── BUGS_ENCONTRADOS.md (bug tracker)
```

## Navigation Paths

### "I want to understand X"

**The codebase architecture**
1. docs/INDEX.md → scroll to "I'm implementing a feature"
2. docs/00-README.md → ARCHITECTURE.md (when ready)
3. .claude/skills/pawo-architect/SKILL.md → deep dives

**Product roadmap**
1. README.md → Features section
2. PRODUCT_VISION.md → complete vision
3. NEXT_STEPS.md → what's next

**How something was built**
1. docs/friction/ → what worked/didn't work
2. docs/adr/ → why we chose this approach
3. Code comments → implementation details

**Testing requirements**
1. docs/test-checklist.md → complete matrix
2. NEXT_STEPS.md → MVP testing section
3. Use `/pawo-qa` → audit features

**Why we chose technology X**
1. README.md → Tech Stack section
2. PRODUCT_VISION.md → Stack information
3. docs/friction/ → evaluation we did
4. docs/adr/ → formal decision (when ready)

## Maintenance Schedule

| When | Action |
|------|--------|
| After implementing a feature | Update NEXT_STEPS.md |
| After fixing a bug | Update BUGS_ENCONTRADOS.md |
| After making a decision | Create docs/adr/NNN-title.md |
| After hitting a barrier | Add to docs/friction/ |
| After reviewing ARCHITECTURE.md PR | Update INDEX.md links |

## Who Owns What

| Document | Owner | Updates |
|----------|-------|---------|
| README.md | Team | Versions, setup steps |
| PRODUCT_VISION.md | `/pawo-pm` | Features, roadmap |
| NEXT_STEPS.md | `/pawo-pm` | Backlog, priorities |
| BUGS_ENCONTRADOS.md | `/pawo-qa` | Bug tracking |
| docs/INDEX.md | `/pawo-docs` | Navigation |
| docs/ARCHITECTURE.md | `/pawo-architect` | System design |
| docs/DATA_MODEL.md | `/pawo-backend` | Database schema |
| docs/CONVENTIONS.md | `/pawo-lead` | Code patterns |
| docs/friction/ | Team | Individual learnings |
| docs/adr/ | Team | Major decisions |

---

**Use [docs/INDEX.md](docs/INDEX.md) for detailed navigation.**

**Last updated:** 2026-03-24
