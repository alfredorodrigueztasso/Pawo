# Friction Logs — Learning What Didn't Work

This folder documents barriers, learnings, and friction points discovered while building Pawo.

## What is a Friction Log?

A friction log is **not** a bug report. It's a record of:
- Problems we encountered with frameworks, libraries, or tools
- Solutions we found (or workarounds)
- Lessons learned for future decisions
- Recommendations based on real experience

Think of it as: "We tried to do X with Y, here's what happened."

## Current Friction Logs

### [orion-5-3-0.md](orion-5-3-0.md)
**Orion DS 5.3.0 Component Discovery & Barriers**

Documents the exploration of Orion DS 5.3.0 components (Alert, Modal, Toast, etc.) and which features/components had blockers preventing full adoption. Answers: "We had 4.2.9 with 10 components but discovered 60+ in 5.3.0. Why didn't we upgrade?"

Key findings:
- FormSection lacks proper title support
- Field component missing error handling
- Button loading state requires boilerplate
- Recommendations for Orion product team

### [orion-next13-app-router.md](orion-next13-app-router.md)
**Next.js 13+ App Router & Orion DS Integration Learnings**

Documents the experience of using Orion DS components within Next.js 13+ App Router (Server Components + Client Components). Answers: "What does it feel like to build real UIs with these technologies together?"

Key findings:
- Server Components have great DX but constraints
- Client Components needed more than expected
- Orion theming works but needs setup
- Form patterns are different with Server Actions

## How to Contribute

Found a new friction point? Create a new file:

```bash
# New framework learning
docs/friction/framework-area.md

# New library discovery
docs/friction/library-name.md

# Tool integration issue
docs/friction/tool-integration.md
```

### Friction Log Template

```markdown
# [Framework/Library] — [What You Tried]

**Date discovered:** YYYY-MM-DD
**Version:** X.Y.Z
**Impact:** High/Medium/Low
**Status:** Resolved/Workaround/Blocker

## What We Tried

Clear description of what we were trying to do.

## What Happened

What went wrong, unexpected behavior, or limitation discovered.

## Root Cause

Why did this happen? Is it a bug, design limitation, or usage error?

## Solution/Workaround

What did we do instead? How did we solve it?

## Recommendations

- For framework/library team: How should this be improved?
- For future builders: What should they know?
- For our project: Do we need to change approach?

## Related Issues/PRs

Links to commits, issues, or discussions.

---

**Discovered by:** Name
**Shared with team:** Date (optional)
```

## How Friction Logs Are Used

### For product decisions
- "Should we upgrade Orion DS?" → Check orion-5-3-0.md
- "How hard is integrating X?" → Check friction logs first

### For onboarding
- New developer asks "Why did you choose this over that?" → Friction logs explain the reasoning

### For vendor feedback
- If a friction log documents a real bug or UX problem → Share with vendor

### For retrospectives
- "What did we learn this month?" → Review new friction logs

## Current Learnings Summary

| Area | Friction | Solution | Status |
|------|----------|----------|--------|
| **Orion DS** | 5.3.0 has 60+ components but FormSection/Field have issues | Use 4.2.10 for now, evaluate again | Workaround |
| **Next.js App Router** | Server Components are great but form handling is different | Use Server Actions + careful component split | Resolved |
| **Orion + Tailwind** | Spacing tokens conflict with Tailwind utilities | Use Orion variables only for layout | Resolved |

## Related Documentation

- **[../BUGS_ENCONTRADOS.md](../BUGS_ENCONTRADOS.md)** — Actual bugs found and fixed
- **[../adr/](../adr/)** — Architectural decisions based on these learnings
- **[../ARCHITECTURE.md](../ARCHITECTURE.md)** (planned) — Patterns that emerged from friction

---

**Last updated:** 2026-03-24
**Maintained by:** /pawo-docs skill
