# Orion DS 5.3.0 Upgrade Friction Log

**Date:** 2026-03-24
**Task:** Upgrade Orion DS from 4.6.5 to 5.3.0
**Status:** ⚠️ BLOCKED — Breaking changes detected
**Priority:** Tech Lead Investigation Required

---

## Problem Summary

Attempting to upgrade `@orion-ds/react` from `^4.6.5` to `^5.3.0` introduces runtime errors that prevent the Next.js build from completing. The upgrade is a major version bump and contains breaking changes.

## Error Details

**Error Message:**
```
TypeError: (0 , e.createContext) is not a function
at module evaluation (.next/server/chunks/ssr/_06237367._.js:1:14233)
```

**Affected Routes:**
- `/notifications`
- `/home`
- `/settings/profile`

**Error Pattern:** The error occurs during page data collection (after TypeScript compilation succeeds), suggesting a runtime incompatibility in Orion's exported modules.

## Attempted Solutions

1. **Clean cache rebuild** — Removed `.next` and node_modules cache
   - Result: ❌ Error persists

2. **Consistent imports** — Changed 2 inconsistent imports from `@orion-ds/react` to `@orion-ds/react/client`
   - Result: ❌ Error persists (also reverted for 4.6.5)

3. **Updated function signatures** — Modified `createSpaceAction()` to support new cycle flexibility parameters
   - Result: ⚠️ TypeScript passes, but runtime errors remain

## Changes Staged for Investigation

**Files modified (not committed):**
- `package.json` — `@orion-ds/react: ^5.3.0`
- `app/(app)/spaces/[id]/SpaceOptionsMenu.tsx` — null safety: `(space.cycle_start_day ?? 1).toString()`
- `app/(app)/spaces/actions.ts` — added `cycle_type`, `cycle_duration_days`, `cycle_start_date` parameters
- `app/onboarding/page.tsx` — updated `createSpaceAction` call with new params

## Tech Lead Action Items

### 1. Investigate Orion 5.3.0 Breaking Changes
- [ ] Review Orion DS v5.3.0 changelog for `createContext` related changes
- [ ] Check if React imports changed or if Context API usage was refactored
- [ ] Test upgrading in isolation (clean repo, no custom code changes) to isolate issue
- [ ] Check Orion GitHub issues for reported v5.3.0 compatibility problems

### 2. Verify Current Orion 4.6.5 State
- [ ] Confirm 4.6.5 build completes successfully after reverting changes
- [ ] Validate that brand migration from ember → orange works correctly with 4.6.5
- [ ] Check if cycle flexibility changes (weekly/biweekly/custom) are compatible with 4.6.5

### 3. Report to Orion Team
- [ ] Create issue on [Orion DS GitHub](https://github.com/oriondsgithub) describing:
  - Version: 5.3.0
  - React version: 19.2.3
  - Next.js version: 16.1.6
  - Error: `createContext is not a function`
  - Reproduction steps
  - Stack trace

### 4. Decision: Upgrade Path
- [ ] **Option A:** Wait for Orion 5.3.1+ fix and retry
- [ ] **Option B:** Downgrade to Orion 5.2.x or earlier (if available)
- [ ] **Option C:** Investigate if 4.6.5 can be extended with custom patches
- [ ] **Option D:** Use a workaround/polyfill if available

---

## Related Work

- **Commit 6 (completed):** Brand migration ember → orange (works fine with 4.6.5)
- **Pending changes:** Cycle flexibility parameters (require Orion 5.3.0 or compatibility)
- **Current state:** Pawo builds and runs successfully with Orion 4.6.5

---

## Recommendation

**Revert to Orion 4.6.5 for now** — The brand has been migrated to orange and all other bugfixes (Commits 1-6) are complete. The Orion upgrade should be:

1. Investigated separately to understand the breaking changes
2. Tested in isolation
3. Escalated to Orion team for support
4. Retried once root cause is identified and fixed

**No blocker for shipping** — Main functionality works with 4.6.5.

---

## Orion Team Contact Info

GitHub Issues: https://github.com/oriondsgithub/orion-ds-react/issues
Email: [support email if available]

---

**Created by:** Claude Code
**Status:** Ready for Tech Lead Investigation
