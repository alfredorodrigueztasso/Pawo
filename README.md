# Pawo — Shared Expenses for Couples

A minimal, beautiful web app for couples to divide shared expenses fairly, with personalized splits and zero friction.

## ✨ Features

- **Fair split modes**: 50/50, percentage-based, or income-proportional
- **Realtime balance tracking**: See the current balance update instantly
- **Cycle management**: Monthly cycles that auto-close and archive
- **Simple UI**: Built with Orion DS for a calm, clear experience
- **Transparent**: No hidden fees, no approval gates—just clarity

## 🚀 Quick Start

### 1. Set up Supabase
- Create a free project at [supabase.com](https://supabase.com)
- Get your API URL and anon key from **Settings → API**
- Copy to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### 2. Run the migrations
- Go to Supabase SQL editor
- Copy & paste contents of `supabase/migrations/001_initial_schema.sql`
- Execute

### 3. Install and run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 👥 User Journey

**Person A (creates household)**
1. Sign up → `pawo.app/signup`
2. Onboarding: name household, choose split mode, invite partner
3. Home shows balance (waiting for partner)

**Person B (receives invite)**
1. Email: "You're invited to Pawo"
2. Click link → `pawo.app/invite/[token]`
3. Sign up/login → confirm/enter income
4. Auto-added to household, balance appears

**Both (daily)**
1. Add expense from home or `/expenses`
2. Balance updates in real-time
3. When cycle ends → review & close → new cycle starts

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI**: Orion DS 4.2.8
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Patterns**: Server Components, Server Actions, Repository pattern

### Key Files
```
app/
├── (auth)/              # Sign up, login
├── (app)/               # Protected pages (home, expenses, cycle, settings)
├── onboarding/          # 3-step wizard
├── invite/[token]/      # Invitation acceptance
lib/
├── balance.ts           # Pure balance calculation
├── cycle.ts             # Cycle date logic
├── supabase/            # DB queries, auth, realtime
types/
├── index.ts             # TypeScript interfaces
components/
├── balance/BalanceDisplay.tsx  # Realtime balance with subscriptions
```

## 💡 How Balance Works

```
Total: $100
Split: 60% / 40%

Person A should pay: $60
Person A paid: $40
→ Person A owes: $20

Person B should pay: $40
Person B paid: $60
→ Person B gets: $20
```

## 🔑 Core Concepts

### Split Modes
- **Manual**: Fixed percentage (50/50, 70/30, etc.)
- **Income**: Auto-calculated from monthly salaries
- **Per-expense override**: Change split for specific expenses

### Cycles
- Default: 1st to end of month (configurable)
- Automatic: Close old → create new
- Immutable: Past cycles archived forever

### No Approvals
- Add expense → partner notified (not blocked)
- Request review → optional, non-blocking
- Close cycle → both see settlement, either can initiate

## 📦 What's Included

✅ Authentication (Supabase Auth)
✅ Household creation + invitation
✅ Realtime balance display
✅ Add/edit/delete expenses
✅ Close cycles with settlement calc
✅ Cycle history

⏳ Coming soon:
- Review system for expenses
- Email notifications
- Expense receipts
- Categories & reports
- In-app messaging

## 🎨 Customization

### Change theme
Edit `app/layout.tsx`:
```typescript
<ThemeProvider theme="red"> {/* or 'deepblue', 'orange' */}
```

### Add a new field
1. Update SQL migration
2. Add to `types/index.ts`
3. Update `lib/supabase/queries.ts`
4. Add to form UI

## 📝 Development Notes

- **Server Components by default** → faster, less client JS
- **Realtime only on BalanceDisplay** → balance updates instantly
- **Server Actions** → no API routes needed for mutations
- **Pure functions** → balance logic is testeable and independent
- **Orion tokens** → no hardcoded colors, uses CSS variables

## 🚢 Deployment

### Vercel (recommended)
```bash
npm run build
# Push to GitHub → auto-deploy on Vercel
```

### Self-host
```bash
npm run build
npm run start
```

Set environment variables on your host (Heroku, Railway, etc.)

## 📚 Documentation

Complete documentation is organized in `docs/` and at the project root:

| Document | Purpose |
|----------|---------|
| **[docs/INDEX.md](docs/INDEX.md)** | Navigation guide to all documentation |
| **[PRODUCT_VISION.md](PRODUCT_VISION.md)** | Product roadmap and completed features |
| **[NEXT_STEPS.md](NEXT_STEPS.md)** | Next features to build and testing checklist |
| **[BUGS_ENCONTRADOS.md](BUGS_ENCONTRADOS.md)** | QA audit findings (resolved and pending) |

See **[docs/INDEX.md](docs/INDEX.md)** for the full documentation structure.

## 🤖 AI Skills

This project includes specialized AI agents (skills) for different roles:

| Skill | Role | Use When |
|-------|------|----------|
| `/pawo-design-lead` | Design direction | Aligning features with product vision |
| `/pawo-pm` | Product specs | Planning and breaking down features |
| `/pawo-architect` | Architecture decisions | Major technical decisions |
| `/pawo-lead` | Code review | Validating implementation |
| `/pawo-ui` | UI components | Building UI with Orion DS |
| `/pawo-backend` | Backend logic | Database and server actions |
| `/pawo-qa` | Quality assurance | Testing and bug detection |

See [.claude/skills/README.md](.claude/skills/README.md) for more details.

## 📞 Support

- **Documentation:** See [docs/INDEX.md](docs/INDEX.md) for navigation
- **Code questions:** Check existing code comments
- **Feature requests:** Use `/pawo-pm` skill
- **Bug reports:** See [BUGS_ENCONTRADOS.md](BUGS_ENCONTRADOS.md)

---

**Built for couples who want clarity without complexity**
