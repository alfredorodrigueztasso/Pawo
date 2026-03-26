# Pawo Documentation Index

Welcome to the Pawo documentation system. This guide helps you navigate all project documentation.

---

## 📍 Quick Links

| Section | Purpose | Files |
|---------|---------|-------|
| **Getting Started** | Setup, quick start, first run | README.md, SETUP.md (planned) |
| **Product** | Vision, roadmap, feature specs | PRODUCT_VISION.md, ROADMAP.md |
| **Implementation** | Status, progress, tracking | implementation/STATUS.md |
| **Infrastructure** | Dependencies, upgrades, tooling | infrastructure/orion/ |
| **Architecture** | Tech decisions, patterns, design | ARCHITECTURE.md (planned) |
| **Technical** | Data model, API, components | DATA_MODEL.md, API.md (planned) |
| **Quality** | Bugs, testing, QA findings | BUGS_ENCONTRADOS.md, test-checklist.md |
| **Friction Logs** | Framework learnings & barriers | friction/ |
| **Team & Skills** | Specialized roles & workflows | .claude/skills/ |

---

## 📂 Directory Structure

```
pawo/
├── README.md                           # Start here: what is Pawo, quick start
├── PRODUCT_VISION.md                   # Product vision, MVP, roadmap
├── BUGS_ENCONTRADOS.md                 # QA audit findings (resolved + pending)
│
├── docs/
│   ├── INDEX.md                        # You are here
│   ├── ROADMAP.md                      # Next features to build (planning)
│   ├── SETUP.md                        # (planned) Local development setup
│   ├── ARCHITECTURE.md                 # (planned) System design & patterns
│   ├── DATA_MODEL.md                   # (planned) Database schema
│   ├── CONVENTIONS.md                  # (planned) Code style & naming
│   ├── API.md                          # (planned) Server Actions reference
│   ├── COMPONENTS.md                   # (planned) Orion DS usage guide
│   ├── test-checklist.md               # Testing matrix
│   ├── adr/                            # Architecture Decision Records
│   │   ├── 001-use-orion-ds.md
│   │   └── 002-supabase-auth.md
│   ├── friction/                       # Framework learnings & barriers
│   │   ├── orion-5-3-0.md
│   │   └── orion-next13-app-router.md
│   ├── implementation/                 # Implementation tracking & status
│   │   └── STATUS.md
│   └── infrastructure/                 # Infrastructure & dependencies
│       └── orion/
│           ├── UPGRADE_PLAN.md         # Orion DS version upgrade plans
│           └── FEEDBACK_v5.5.4.md      # User experience & feedback
│
├── .claude/skills/                     # Team of specialized AI agents
│   ├── README.md                       # Overview of all skills
│   ├── pawo-design-lead/
│   ├── pawo-pm/
│   ├── pawo-lead/
│   ├── pawo-ui/
│   ├── pawo-backend/
│   ├── pawo-qa/
│   ├── pawo-commit/
│   ├── pawo-architect/
│   ├── pawo-devops/
│   ├── pawo-security/
│   └── pawo-docs/                     # This guide (documentation maintenance)
│
├── app/                               # Next.js app (see ARCHITECTURE.md)
├── lib/                               # Shared utilities (balance, cycle, DB)
├── types/                             # TypeScript types
├── components/                        # Shared React components
├── public/                            # Static assets
├── supabase/                          # Migrations & SQL
└── tsconfig.json, package.json, etc.
```

---

## 🎯 How to Find What You Need

### I'm new to Pawo
1. Read: **README.md** (what, why, quick start)
2. Read: **PRODUCT_VISION.md** (features, vision)
3. Read: **docs/ROADMAP.md** (what's planned next)
4. Explore: **app/** folder structure
5. Run: `npm install && npm run dev`

### I'm implementing a feature
1. **Plan phase:** Use `/pawo-pm` skill to write spec
2. **Design review:** Use `/pawo-design-lead` skill for UX alignment
3. **Implementation:** Check **CONVENTIONS.md** (planned) for code style
4. **Code review:** Use `/pawo-lead` skill to validate
5. **QA:** Use `/pawo-qa` skill to audit

### I found a bug
1. Document it in **BUGS_ENCONTRADOS.md**
2. Check if it's P1/P2/P3 (critical/medium/low)
3. If resolved, move to "✅ Bugs Resueltos" section
4. If pending, move to "❌ Bugs Pendientes" section

### I'm making architectural decisions
1. Check existing **ARCHITECTURE.md** (planned) for patterns
2. Use `/pawo-architect` skill for major decisions
3. Document decision in **docs/adr/NNN-title.md**
4. Update **ARCHITECTURE.md** with new pattern

### I'm debugging Orion DS issues
1. Check **docs/friction/orion-5-3-0.md** (component barriers)
2. Check **docs/friction/orion-next13-app-router.md** (framework learnings)
3. Check **docs/infrastructure/orion/FEEDBACK_v5.5.4.md** (version feedback)
4. Check **docs/ROADMAP.md** for known issues with Orion
5. Use `/pawo-ui` skill for component help

### I need to understand the database
1. Read: **NEXT_STEPS.md** → "Database migrations" section
2. Read: **DATA_MODEL.md** (planned) for full schema
3. Check: `supabase/migrations/` for chronological SQL
4. Use `/pawo-backend` skill for schema questions

---

## 📋 Documentation Standards

### File Naming
- **Root docs:** `UPPERCASE_WITH_UNDERSCORES.md` (e.g., `PRODUCT_VISION.md`)
- **Inside docs/:** lowercase or descriptive (e.g., `setup.md`, `adr/001-title.md`)

### Language
- **UI/Copy:** Español (user-facing text)
- **Code:** English (variables, functions)
- **Docs:** Español (technical explanation)
- **Comments in code:** Español (why) + English (TODO tags)

### When to Update Docs

| Event | Docs to Update |
|-------|---|
| New feature implemented | docs/ROADMAP.md, docs/ARCHITECTURE.md, docs/API.md |
| Database schema changes | docs/DATA_MODEL.md, docs/ROADMAP.md |
| Bug found | BUGS_ENCONTRADOS.md |
| Bug resolved | BUGS_ENCONTRADOS.md (move section) |
| New dependency added | README.md, docs/ARCHITECTURE.md |
| Dependency upgrade | docs/infrastructure/COMPONENT/FEEDBACK_*.md, docs/ROADMAP.md |
| Architectural decision | docs/adr/NNN-title.md |
| New pattern/convention | docs/CONVENTIONS.md |
| Framework learning | docs/friction/topic.md |
| Implementation progress | docs/implementation/STATUS.md |

---

## 🔄 Related Documentation

### Main project docs (always keep updated)
- **README.md** — First impression, setup, quick start
- **PRODUCT_VISION.md** — What we're building and why
- **docs/ROADMAP.md** — What's next to build or fix
- **BUGS_ENCONTRADOS.md** — Known issues and fixes
- **docs/implementation/STATUS.md** — Current implementation progress

### Technical deep dives (build gradually)
- **docs/SETUP.md** — Detailed local development
- **docs/ARCHITECTURE.md** — Folder structure, patterns, flow
- **docs/DATA_MODEL.md** — Full database schema with relationships
- **docs/CONVENTIONS.md** — Naming, imports, commit format
- **docs/API.md** — Server Actions, inputs, outputs, errors
- **docs/COMPONENTS.md** — Orion DS components we use

### Decision records (one per decision)
- **docs/adr/*** — Architecture decisions, trade-offs, rationale

### Learning & barriers (live as we learn)
- **docs/friction/orion-5-3-0.md** — Component discovery & blockers
- **docs/friction/orion-next13-app-router.md** — Framework + router learnings

### Infrastructure & Dependencies (tech upgrades & feedback)
- **docs/infrastructure/orion/UPGRADE_PLAN.md** — Version upgrade planning
- **docs/infrastructure/orion/FEEDBACK_v5.5.4.md** — User experience reports

### Skills & workflows (how team works)
- **.claude/skills/README.md** — Overview of all 12 specialized agents
- **.claude/skills/*/SKILL.md** — Each skill's purpose and how to use it

---

## 💡 Pro Tips

### Search by topic
```bash
# Find all docs mentioning "balance"
grep -r "balance" /Users/alfredo/Documents/pawo/docs/

# Find all TODOs in docs
grep -r "TODO" /Users/alfredo/Documents/pawo/docs/
```

### Keep docs in sync with code
- When you change a feature, update its docs
- When you add a migration, update DATA_MODEL.md
- When you create a new pattern, update CONVENTIONS.md

### Use the skills as documentation co-authors
- `/pawo-docs` maintains documentation structure and completeness
- `/pawo-architect` writes architectural decisions (docs/adr/)
- `/pawo-pm` writes feature specs (linked from NEXT_STEPS.md)
- `/pawo-qa` writes testing docs (test-checklist.md)

---

**Last updated:** 2026-03-26
**Maintained by:** /pawo-docs skill
**Status:** Core structure in place, organized by category (product, implementation, infrastructure). Gradual expansion in progress.

