# Pawo — Next Steps & Roadmap

## 🚀 Immediate Actions (This Week)

### 1. Set Up Supabase
```bash
# Visit supabase.com
# Create a new project (free tier is fine)
# Copy API URL and anon key → paste into .env.local
```

File: `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Run Database Migrations
```bash
# Go to Supabase dashboard → SQL Editor
# Create new query
# Copy & paste: supabase/migrations/001_initial_schema.sql
# Execute (should see "Success" message)
```

### 3. Test Locally
```bash
npm run dev
# Open http://localhost:3000
# Sign up → create household → try adding an expense
```

### 4. Deploy to Vercel (Optional but Recommended)
```bash
# Push code to GitHub
# Go to vercel.com
# Import repository → set env vars → deploy
```

---

## 📋 MVP Testing Checklist

### Auth Flow
- [ ] Sign up with email & password
- [ ] Password validation works (8+ chars, matching)
- [ ] Can log in with created account
- [ ] Unauthenticated users redirected to login
- [ ] Session persists on page reload

### Onboarding
- [ ] Wizard step 1: Create household
- [ ] Wizard step 2: Choose split mode (manual works, income mode works)
- [ ] Wizard step 3: Invite partner
- [ ] Household created in database
- [ ] Partner can receive invite link

### Invitation
- [ ] Email shows invite link (check console for now)
- [ ] Click link → sees household name
- [ ] New user can sign up from invite
- [ ] Existing user can log in + accept
- [ ] User auto-added to household
- [ ] Can't accept expired/invalid token

### Expenses
- [ ] Add expense from home (quick form)
- [ ] Add expense from /expenses (full form)
- [ ] Expense appears in list
- [ ] Can delete expense
- [ ] Balance updates in real-time
- [ ] Both members see same balance

### Cycle
- [ ] Current cycle shows on /cycle
- [ ] Progress bar updates correctly
- [ ] Can close cycle (modal appears)
- [ ] Settlement amount calculated correctly
- [ ] New cycle auto-creates after close
- [ ] Old cycle marked as "closed"

### UI/UX
- [ ] Sidebar navigation works
- [ ] All pages respond on mobile (375px+)
- [ ] Forms don't submit twice (loading states work)
- [ ] Error messages display correctly
- [ ] Orion DS theme applies (blue accent by default)

---

## 🔧 Phase 2: Refinements (After MVP Validation)

### High Priority

#### 1. Review System
**Why**: Couples often question specific expenses — need transparent way to discuss without blocking.

**Implementation**:
- Add "Request review" button on expense details page
- Create review form (question + optional suggested amount)
- Show "Under review" status with notification
- Ability to respond/edit/agree

**Files to create**:
- `app/(app)/expenses/[id]/page.tsx` — Expense detail + review panel
- `app/(app)/expenses/[id]/actions.ts` — Review actions
- `components/expenses/ReviewPanel.tsx` — Review UI

#### 2. Real Email Invitations
**Why**: Users can't actually invite partners without email sending.

**Implementation**:
- Use Resend or SendGrid API
- Send templated email with invite link
- Track email status in database

**Code change**:
```typescript
// app/onboarding/actions.ts
const { error } = await resend.emails.send({
  from: 'invites@pawo.app',
  to: data.partnerEmail,
  subject: 'You're invited to Pawo!',
  html: `<a href="${inviteUrl}">Join household</a>`
});
```

#### 3. Settings Page
**Why**: Users need to update income, currency, cycle day, etc.

**Implementation**:
- `/settings` page with forms
- Update household config
- Update member income
- View members
- Option to invite new partner

**Files**:
- `app/(app)/settings/page.tsx`
- `app/(app)/settings/actions.ts`

#### 4. Notifications
**Why**: Users should be notified of partner actions (added expense, closed cycle, etc.)

**Implementation**:
- Real-time notification center on `/notifications`
- Toast notifications for quick feedback
- Mark as read

**Components**:
- `components/notifications/NotificationCenter.tsx`
- `components/notifications/Toast.tsx`

#### 5. Expense Detail Page
**Why**: See full expense, request review, suggest changes.

**Implementation**:
- `/expenses/[id]` page
- Show all details (date, amount, payer, description)
- Review panel
- Edit/delete options (only for owner)

---

## 🎯 Phase 3: Scale Features (1-2 Months)

### Categories
```typescript
// types/index.ts
type Category = 'groceries' | 'utilities' | 'entertainment' | 'transport' | 'other';

// expenses table: add category field
```

### Recurring Expenses
- "Groceries every week" → auto-create every Monday
- Settable reminder
- Can edit/skip individual occurrence

### Reports
- Monthly summary (total, by category, by payer)
- Export CSV
- Year-to-date trends

### Payment Tracking
- Track who paid settlement to whom
- Confirmation marks
- Historical settlements

### In-App Messaging
- Chat between partners
- Discuss specific expenses
- Link messages to expenses/cycles

---

## 🚀 Phase 4: Expansion (After Proving Concept)

### Multi-Person Households
- Extend from couples → roommates, families, groups
- Update balance calculation for 3+ people
- Split modes for groups

### Recurring Shared Trips
- Create "trip" household
- Track shared expenses during trip
- Settlement at end

### Payment Integration
- Stripe/PayPal for settlement payments
- Auto-payment on close cycle
- Payment confirmations

### Mobile Apps
- React Native (iOS + Android)
- Offline support
- Push notifications

### Analytics
- Spending patterns
- Cost per person over time
- Budget recommendations

---

## 📚 Learning & Testing

### Add Unit Tests
```bash
npm install --save-dev @testing-library/react vitest

# Test pure functions first
# app/test/balance.test.ts
# app/test/cycle.test.ts
```

### Example Test
```typescript
import { calculateBalance, suggestSplit } from '@/lib/balance';

describe('Balance Calculation', () => {
  it('should calculate correct adjustment when one person paid more', () => {
    const expenses = [
      { id: '1', amount: 100, paid_by: 'A' },
      { id: '2', amount: 0, paid_by: 'B' },
    ];
    const members = [
      { user_id: 'A', split_percentage: 50, name: 'Alice' },
      { user_id: 'B', split_percentage: 50, name: 'Bob' },
    ];
    
    const result = calculateBalance(expenses, members);
    expect(result.adjustmentA).toBe(50); // A paid 100, should pay 50
  });
});
```

### Add E2E Tests
```bash
npm install --save-dev @playwright/test

# Test full user flows
# e2e/signup.spec.ts
# e2e/add-expense.spec.ts
```

---

## 💼 Deployment Checklist

### Before Launching
- [ ] Real email sending configured
- [ ] Error handling for all user actions
- [ ] Loading states on all buttons
- [ ] Mobile-responsive verified (test on real phone)
- [ ] Passwords are hashed (Supabase Auth handles this)
- [ ] No console.logs in production
- [ ] Environment variables set on production (Vercel)
- [ ] Database backups enabled (Supabase does this)
- [ ] HTTPS enforced (Vercel does this)

### Security
- [ ] Enable Supabase Row Level Security
- [ ] Set up storage buckets for receipts (future)
- [ ] Review Supabase logs for abuse
- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection (Next.js has this by default)

### Monitoring
- [ ] Set up Sentry or Vercel Analytics
- [ ] Monitor error rates
- [ ] Check Supabase performance
- [ ] User feedback channel

---

## 🎓 Documentation to Write

- [ ] API docs for future developers
- [ ] Architecture diagram (Miro/Excalidraw)
- [ ] Component Storybook setup
- [ ] Database schema documentation
- [ ] Supabase RLS policies guide

---

## 💡 Ideas for Post-MVP

- **Cash out feature**: Record actual payments between partners
- **Budget sync**: Set monthly budget, track progress
- **Group splits**: More than 2 people
- **Bill splitting**: Split specific expenses unequally
- **Savings tracking**: Track savings goals together
- **Debt payoff**: Prioritized settlement with interest
- **Fair-share calculator**: For uneven income situations

---

## 📞 Staying Aligned

### Weekly Check-in Questions
- [ ] Are users able to complete the signup flow?
- [ ] Is the balance calculation matching expectations?
- [ ] Do invitations work end-to-end?
- [ ] Are there any crashes or errors?
- [ ] What feature would most improve the experience?

### Success Metrics (MVP)
- 10+ active couples using the app
- 100+ transactions tracked
- 0 balance calculation errors
- <1% churn (partners staying engaged)
- 90%+ feature usage (everyone uses at least 3 major features)

---

## 🎉 Final Notes

**Remember**: Pawo isn't about being the most feature-rich. It's about being the least **friction-full** way for couples to divide shared expenses.

Every feature should ask: **"Does this reduce friction or add it?"**

Start simple, test with real users, iterate based on feedback.

Good luck! 🚀

