# Orion DS 5.3.0 Upgrade Friction Log

**Date:** 2026-03-24
**Task:** Upgrade Orion DS from 4.6.5 to 5.3.0
**Status:** BLOCKED — Bug in Orion 5.3.0 (confirmed, reportable)
**Priority:** Report to Orion team, stay on 4.9.8 in the meantime

> Note: package.json specifies `^4.6.5` but npm resolved to 4.9.8 — this is the actual installed version.
> The 4.9.8 build is clean. The 5.x line is what's broken.

---

## Root Cause — CONFIRMED

### The bug: `require()` called inside ESM modules

Orion 5.3.0 introduced a new `optionalDeps` utility to handle components with optional peer dependencies (Calendar, Chart, CodeEditor, etc.). The utility checks at runtime whether those deps are installed.

The implementation uses a synchronous `require()` call inside `.mjs` ESM files:

**`dist/utils/optionalDeps.mjs`** (new in 5.3.0):
```js
function d(e) {
  return (Array.isArray(e) ? e : [e]).every((o) => {
    try {
      return require(o), !0;  // <-- require() inside ESM
    } catch {
      return !1;
    }
  });
}
```

**This is a spec violation.** ESM modules do not have `require` in scope. It is a CommonJS-only global.

### Why TypeScript passes but runtime fails

TypeScript type-checks the module graph without executing code. The `require` identifier doesn't cause a type error because TypeScript sees the `try/catch` around it. The error only surfaces when the module is actually evaluated by the JavaScript runtime.

### Why the error reads `createContext is not a function`

The failure mode is indirect. When Next.js SSR (using Turbopack's webpack interop) processes `@orion-ds/react/client`, it resolves the package as `type: module` and loads `client.mjs`. The `client.mjs` imports `optionalDeps.mjs` at the top level:

```
@orion-ds/react/client
  → client.mjs
    → utils/optionalDeps.mjs  ← module evaluation throws ReferenceError: require is not defined
```

When `optionalDeps.mjs` fails to evaluate, the entire module graph from `client.mjs` downward is poisoned. Downstream SSR chunks that depend on React context (ThemeContext, AlertDialog, etc.) receive `undefined` instead of a loaded React module, causing:

```
TypeError: (0 , e.createContext) is not a function
```

The `e` is React, and `e.createContext` is undefined because React itself failed to load in that chunk — not because React or createContext changed.

### ESM files with illegal `require()` calls in 5.3.0

Confirmed via inspection of the 5.3.0 tarball (`npm pack`):

| File | require() target |
|------|-----------------|
| `dist/utils/optionalDeps.mjs` | peer deps (recharts, date-fns, etc.) |
| `dist/components/Calendar/Calendar.mjs` | `date-fns` |
| `dist/components/Chart/Chart.mjs` | `recharts` |
| `dist/components/CodeEditor/CodeEditor.mjs` | `react-syntax-highlighter` |
| `dist/components/DatePicker/DatePicker.mjs` | `date-fns` |
| `dist/components/CollapsibleFolder/CollapsibleFolder.mjs` | `@dnd-kit/*` |

`optionalDeps.mjs` is the critical one because it is imported by `client.mjs` unconditionally, affecting all consumers.

### Why 4.9.8 is not affected

In 4.9.8, only `CodeEditor.mjs` had a `require()` call (also a bug, but less impactful because CodeEditor is rarely used and not re-exported by `client.mjs`). The `optionalDeps` utility did not exist in 4.9.8 — optional deps were handled at the component level without a shared utility.

---

## Investigation Steps Completed

- [x] Downloaded and inspected 5.3.0 tarball via `npm pack`
- [x] Compared module structure between 4.9.8 (installed) and 5.3.0
- [x] Identified `require()` in ESM files as the root cause
- [x] Confirmed `optionalDeps.mjs` is imported by `client.mjs` unconditionally
- [x] Verified 4.9.8 does not have this issue in the critical code path
- [x] Confirmed this is a bug in Orion, not a React 19 / Next.js 16 incompatibility
- [x] Confirmed available version chain: 5.0.0, 5.0.1, 5.1.0, 5.1.9, 5.1.11, 5.1.13, 5.2.0, 5.3.0

---

## Is this React 19 / Next.js 16 specific?

**No.** This is a standards violation — `require()` is not available in ESM regardless of React or Next.js version. Any framework that loads `client.mjs` as ESM will fail. The error would reproduce in:
- Next.js 14, 15, or 16 (any version with Turbopack or webpack ESM handling)
- Vite + React
- Node.js ESM mode (`node --input-type=module`)

The reason it surfaces in SSR specifically is that Next.js SSR processes `.mjs` files as native ESM (per `"type": "module"` in the package), while the client-side webpack bundle may handle it differently through its own CJS interop layer.

---

## Decision: Upgrade Path

### Ruling out options from the original list

- **Option A: Wait for 5.3.1+** — Correct path. This is a clear bug Orion must fix. File the issue, wait.
- **Option B: Downgrade to 5.2.x** — Check if `optionalDeps.mjs` exists in 5.2.0. If 5.2.0 predates this utility, it may work. However, all 5.x versions should be tested before committing.
- **Option C: Patch 4.6.5 / 4.9.8** — Unnecessary. 4.9.8 is stable and production-ready.
- **Option D: Workaround/polyfill** — The only viable workaround would be a Next.js `transpilePackages` config to force CJS bundling of `@orion-ds/react`, which avoids the ESM `require()` issue. **This is a valid temporary workaround** (see below).

### Recommended path

**Stay on 4.9.8.** File the bug with Orion. Evaluate upgrading after a fix is released.

The only reason to upgrade to 5.x is if there are features Pawo actively needs from 5.x. Currently there are none blocking.

### Workaround if upgrade to 5.x becomes urgent

Add to `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  transpilePackages: ['@orion-ds/react'],
};
```

This forces Next.js to treat the package as CommonJS, bypassing the ESM module evaluation entirely. The `.cjs` bundles in Orion 5.3.0 do not have this bug — they use `require()` correctly.

**Note:** Test this workaround before relying on it. Depending on the Turbopack version, `transpilePackages` behavior may vary.

---

## Bug Report for Orion Team

**Title:** `require() is not defined` in ESM bundles — `client.mjs` fails in Next.js SSR (v5.3.0)

**Summary:**
`@orion-ds/react@5.3.0` introduced `dist/utils/optionalDeps.mjs` which uses `require()` — a CommonJS-only global — inside an ESM `.mjs` file. This causes a `ReferenceError` when the module is evaluated in an ESM context, which crashes the entire `@orion-ds/react/client` module graph in Next.js SSR, manifesting as `TypeError: createContext is not a function`.

**Reproduction:**
1. `npm install @orion-ds/react@5.3.0` in a Next.js 16 (or any Next.js) project
2. Import any component from `@orion-ds/react/client` in a Server Component or page
3. Run `next dev` or `next build`
4. Observe `TypeError: (0, e.createContext) is not a function` in SSR

**Affected file:** `dist/utils/optionalDeps.mjs` (and `Calendar.mjs`, `Chart.mjs`, `CodeEditor.mjs`, `DatePicker.mjs`, `CollapsibleFolder.mjs`)

**Root cause:** `require()` used inside ESM modules. In ESM, `require` is not in scope. Use `import()` (dynamic) instead for optional dependency checking, or limit the `require()` pattern to `.cjs` files only.

**Environment:**
- `@orion-ds/react`: 5.3.0
- React: 19.2.3
- Next.js: 16.1.6
- Node.js: 24.x
- Platform: macOS (darwin 24.6.0)

**Previous working version:** 4.9.8

**GitHub Issues:** https://github.com/orion-ds/orion/issues

---

## Current State

- Pawo runs on `@orion-ds/react@4.9.8` (resolved from `^4.6.5`)
- Build is clean, brand "orange" works (commit 4272415)
- No upgrade needed for current feature set
- No action required until Orion publishes a fix

---

**Investigated by:** Tech Lead (Claude Code)
**Investigation date:** 2026-03-24
**Status:** Root cause confirmed, ready to file issue with Orion
