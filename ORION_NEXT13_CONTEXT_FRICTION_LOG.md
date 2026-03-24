# Orion DS + Next.js 13+ App Router: Context Provider Friction Log

**Date:** 2026-03-24
**Scenario:** Pawo — Next.js 16 + React 19 + Orion DS 4.9.8
**Issue:** `ToastProvider` cannot be used directly in Server Component layouts
**Status:** Documented — Requires design guidance from Orion team

---

## What I Tried

In `app/(app)/layout.tsx`, I wanted to provide Orion's `ToastProvider` to all authenticated routes (pages under `/spaces`, `/expenses`, `/settings`, etc.).

**The natural approach:**
```typescript
// app/(app)/layout.tsx
import { ToastProvider } from "@orion-ds/react/client";

export default async function AppLayout({ children }) {
  const user = await getUser(); // async operation, Server Component

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
```

This is the pattern I expected to work because:
1. Other design systems (MUI, Chakra) work this way
2. The import is clean: `@orion-ds/react` suggests "just use this component"
3. Layout files in Next.js naturally need to be async to check authentication

---

## What Happened

**Error in browser:**
```
Runtime TypeError
createContext only works in Client Components. Add the "use client" directive
at the top of the file to use it.
```

**Call stack:**
```
app/(app)/layout.tsx (3:1) @ module evaluation
```

The page fails to render. All routes under `/app/` are broken.

---

## Why This Happened

### Root Cause: Next.js Server Components + React Context

Next.js 13's App Router introduced a distinction:
- **Server Components** (default): Execute only on the server, great for DB queries, auth checks, secrets
- **Client Components** (`"use client"`): Execute in the browser, can use React hooks and Context

**React Context (including Orion's `ToastProvider`) requires Client Components** because:
- Context API (`React.createContext`) was designed for browser-side state sharing
- A Context provider must be a Client Component to create and provide context values
- When a Server Component tries to render a Client Component that creates Context, Next.js cannot serialize the context value across the server/client boundary

### The Specific Sequence

1. `app/(app)/layout.tsx` is a Server Component (it's async, calls `await getUser()`)
2. It tries to render `<ToastProvider>` from Orion
3. `ToastProvider` internally calls `React.createContext()` during module evaluation
4. Server Components cannot call `createContext` — only Client Components can
5. Runtime error: `TypeError: createContext is not a function`

### Why This Is Not Obvious

**From a user perspective:**
- The import `@orion-ds/react/client` suggests "this is for client usage" — but I had to use it in a Server Component to wrap my app
- No error at development time (TypeScript passes, imports are fine)
- The error only happens at runtime when Turbopack evaluates the module
- Most tutorials show wrapping providers in `layout.tsx` without mentioning Server vs Client Components
- Other libraries (Next.js auth, Supabase) also need to be in layout.tsx, so it feels like all providers should go there

---

## The Solution I Implemented

Create a separate Client Component file:

```typescript
// app/(app)/providers.tsx
"use client";

import { ToastProvider } from "@orion-ds/react/client";

export function Providers({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
```

Then use it in the Server Component layout:

```typescript
// app/(app)/layout.tsx
import { Providers } from "./providers";

export default async function AppLayout({ children }) {
  const user = await getUser(); // still async, still Server Component

  return (
    <Providers>
      {children}
    </Providers>
  );
}
```

**Why this works:**
- `layout.tsx` is still a Server Component (can do `await`, auth checks)
- `providers.tsx` is a Client Component that handles all Context creation
- The boundary between them is clean and explicit

---

## Analysis: Why This Is Friction

### 1. **Documentation Gap**

The Orion docs say:
> "Import ToastProvider from @orion-ds/react/client and wrap your app"

But they don't mention that "wrap your app" means "wrap it in a Client Component" — especially in Next.js 13+ where the app-level layout is a Server Component by default.

### 2. **Implicit Assumption in the API**

Orion's design assumes:
- You're using Create React App, Vite, or Next.js Pages Router (all Client-first architectures)
- Your top-level app file can be a Client Component

But Next.js 13+ App Router flips this: layouts are Server-first by default. The mental model doesn't match.

### 3. **Runtime Error Is Indirect**

The error message says `"createContext is not a function"`, which is technically true, but the real issue is "you can't call `createContext` from a Server Component". The error is correct but not actionable without understanding Server vs Client Components.

### 4. **Repeats Across All Orion Providers**

This isn't just `ToastProvider`. The same issue affects:
- `ModalProvider` (for `useDisclosure`)
- `AlertDialogProvider` (if it exists)
- Any component that creates React Context

A user discovering this once still hits it again with the next Orion provider.

---

## What Orion Could Do (Suggestions)

### Option A: Export a Next.js-Aware Wrapper

Provide a component that handles the Server/Client boundary automatically:

```typescript
// In @orion-ds/react/next
export function createNextProviders() {
  return {
    Toast: (props) => /* ... */,
    Modal: (props) => /* ... */,
  };
}

// In app/layout.tsx (Server Component)
import { Toast, Modal } from "@orion-ds/react/next";

export default async function Layout({ children }) {
  return (
    <Toast>
      <Modal>
        {children}
      </Modal>
    </Toast>
  );
}
```

**Pros:** Zero boilerplate, works out of the box
**Cons:** Requires new package export, conditional rendering logic

### Option B: Provide a Template File

Include in Orion's docs/starter kit:

```typescript
// Copy this to your app/(app)/providers.tsx
"use client";
export function Providers({ children }) {
  // Instructions: Import all Orion providers here
}
```

**Pros:** Minimal change, educational
**Cons:** Requires user to copy code, still not automatic

### Option C: Export a Composite Provider from `@orion-ds/react/next`

```typescript
// @orion-ds/react/next
import { ToastProvider, ModalProvider } from "../react/client";

export const OrionProviders = ({ children }) => (
  <ToastProvider>
    <ModalProvider>
      {children}
    </ModalProvider>
  </ToastProvider>
);

// In app/(app)/providers.tsx
"use client";
export { OrionProviders as Providers };
```

**Pros:** Single import, clear intent
**Cons:** Opinionated (locks users into specific providers)

### Option D: Add a Hook for Server Components

Provide a way to register context without wrapping:

```typescript
// @orion-ds/react (new API)
export function useOrionInitialize() {
  // Called in Server Component, sets up providers for SSR
  // Implementation: Internal registry that Client Components query
}

// In app/(app)/layout.tsx
export default async function Layout({ children }) {
  useOrionInitialize(); // Registers providers in context
  return children; // No wrapper needed
}
```

**Pros:** Feels automatic, no boilerplate
**Cons:** Complex implementation, magic that's hard to debug

---

## Recommendation for Orion Team

**Short term:** Add a prominent section in docs titled **"Next.js 13+ App Router Setup"** with:
- Explanation of Server Components vs Client Components
- The provider pattern (separate `providers.tsx` file)
- Copy-paste-ready template

**Medium term:** Export a `@orion-ds/react/next` package with pre-made provider wrappers or a composite `<OrionProviders>` component

**Long term:** Consider if Context API is the right choice for Orion's API given the Next.js ecosystem's Server Component shift. Explore alternatives like:
- React Server Components-compatible context (if it exists)
- Zustand/Jotai (client-side stores, don't require wrapping at app root)
- Custom hooks that don't require context

---

## Impact on Pawo

**Before fix:** Entire app broken, `/spaces`, `/expenses`, etc., all fail
**After fix:** Works fine, but required understanding Next.js architecture
**Friction level:** High (blocks all authenticated pages)
**Discovery time:** ~10 minutes (error message not directly actionable)

---

## Related Work

This friction is specific to:
- Next.js 13+ (App Router with Server Components)
- React 16.8+ (Context API)
- Orion DS 4.x

**Not affected:** Next.js 12 (Pages Router), Create React App, Vite + React

---

## Conclusion

This is not a bug in Orion DS — it's a design mismatch between:
1. **Orion's API design** (assumes old-school Client-first architectures)
2. **Next.js 13+ paradigm** (Server-first by default)

The fix is simple (one wrapper file), but the friction is real and repeats for every new developer on a Next.js 13+ project using Orion providers.

---

**Documented by:** Claude Code (as Pawo developer)
**Date:** 2026-03-24
**Framework context:** Next.js 16.1.6 + React 19.2.3 + Orion DS 4.9.8
**Suggestion status:** Ready for Orion team product discussion
