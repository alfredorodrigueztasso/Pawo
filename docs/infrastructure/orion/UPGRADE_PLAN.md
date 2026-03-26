# Orion DS Upgrade Plan: v4.6.5 → v5.5.2

**Analysis Date**: 2026-03-25
**Risk Level**: 🟡 MEDIUM (No blockers for Pawo, but need validation)
**Effort**: 2-4 hours

---

## 📊 Breaking Changes Summary

### Critical Changes (⚠️ Breaking)

| What Changed | v4.6.5 | v5.5.2 | Impact on Pawo |
|--------------|--------|--------|-----------------|
| **Chat Component** | ✅ Exported | ❌ Removed | 🟢 **NOT USED** |
| **Rich Text Editor** | ✅ `/rich` export | ❌ Removed | 🟢 **NOT USED** |
| **Templates Path** | `@orion-ds/react/templates` | `@orion-ds/react/blocks/templates` | 🟢 **NOT USED** |
| **useStreamingText Hook** | ✅ Available | ❌ Removed | 🟢 **NOT USED** |

### Safe Changes (✅ Compatible)

- ✅ All component APIs (Button, Card, Field, Modal, etc.)
- ✅ CSS variables & theming
- ✅ Spacing/layout tokens
- ✅ React 19 compatibility
- ✅ Next.js 16 compatibility
- ✅ Dark mode support

### Benefits of Upgrade

- 📦 **20% smaller bundle** (636KB → 508KB tarball)
- 🎯 **Latest features & fixes** in v5.5.2
- ⚠️ **Avoid broken v5.3.0** (marked as broken in npm)
- 🚀 **Future-proof** for upcoming Orion updates

---

## 🔍 Pawo-Specific Audit

### Components Used in Pawo

Searched all files in `app/`, `components/` for Orion imports:

**Using these (all compatible v4→v5):**
- ✅ Button
- ✅ Card
- ✅ Field
- ✅ Alert
- ✅ Modal
- ✅ Dialog
- ✅ Textarea
- ✅ Stepper
- ✅ Toast/ToastProvider
- ✅ Select
- ✅ CheckBox
- ✅ Container
- ✅ Tabs
- ✅ Notification

**NOT Using (so breaking changes don't affect us):**
- ❌ Chat
- ❌ Rich Text Editor
- ❌ Templates (from root export)
- ❌ useStreamingText

### Import Paths Used

```typescript
// Current (all work in v4 and v5)
import { Button, Card, Field, ... } from "@orion-ds/react/client"
import { Alert, Modal, ... } from "@orion-ds/react"
import "@orion-ds/react/styles.css"
```

✅ **No path changes needed** — All imports are compatible

---

## 🚀 Upgrade Strategy

### Step 1: Create Safe Backup Branch
```bash
git checkout -b upgrade/orion-ds-v5
```

### Step 2: Update Package
```bash
npm install @orion-ds/react@5.5.2
npm install
```

### Step 3: Validation Checklist

- [ ] **Build succeeds**
  ```bash
  npm run build
  ```

- [ ] **Dev server starts**
  ```bash
  npm run dev
  ```

- [ ] **Auth flows work** (signup, login, forgot password)
  - [ ] No console errors
  - [ ] Forms render correctly
  - [ ] Validation messages appear

- [ ] **Expense flows work** (add, view, delete)
  - [ ] Modal opens/closes
  - [ ] Form submits
  - [ ] Balance updates

- [ ] **Settings page works**
  - [ ] All forms render
  - [ ] Updates save

- [ ] **Cycle flows work**
  - [ ] Modal opens
  - [ ] Calculations correct

- [ ] **Mobile responsive** (test at 375px)

- [ ] **Orion DS styling applies**
  - [ ] Colors correct (orange brand)
  - [ ] Spacing correct
  - [ ] Dark mode (if used)

### Step 4: Merge & Deploy

```bash
# If validation passes
git add package.json package-lock.json
git commit -m "upgrade: @orion-ds/react@4.6.5 → 5.5.2"
git push origin upgrade/orion-ds-v5

# Create PR for final review
```

---

## ⚠️ Risk Mitigation

### If something breaks:

1. **Check imports** — Are we importing from removed exports?
   - Search for `from "@orion-ds/react/rich"`
   - Search for `from "@orion-ds/react/templates"`
   - Search for `Chat` component
   - Search for `useStreamingText`

2. **Component API changes** — Check if component props changed
   - Run dev server, look for console errors
   - Check styled elements render correctly

3. **Styling issues** — CSS variable compatibility
   - Check if spacing is correct
   - Verify colors render properly
   - Check dark mode (if enabled)

4. **Rollback** — If major issues:
   ```bash
   npm install @orion-ds/react@4.6.5
   npm install
   ```

---

## 📋 Pre-Upgrade Checklist

Before starting, verify:

- [ ] You're on `main` branch and it's up to date
- [ ] All changes are committed or stashed
- [ ] You can run tests/build locally
- [ ] You have 2-3 hours for validation

---

## 🎯 Recommendation

**PROCEED WITH UPGRADE** ✅

**Why:**
- No code changes needed (import paths compatible)
- Only validation needed (smoke tests)
- 20% smaller bundle
- Latest stable version (5.5.2)
- Avoids broken v5.3.0 for future development

**When:**
- Next available work session
- Before adding Phase 3 features (categories, recurring expenses)

**Time estimate:**
- Update package: 5 min
- Validation: 1-2 hours
- Troubleshooting (if needed): 30 min - 1 hour

---

## 📞 Next Steps

1. **Ready to start?** Create branch and run upgrade
2. **Questions?** Describe any blockers and I'll investigate
3. **Post-upgrade?** Run full QA checklist from IMPLEMENTATION_STATUS.md

