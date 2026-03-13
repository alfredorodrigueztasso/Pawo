# Pawo End-to-End Test Checklist

## Setup & Prerequisites

Before starting, ensure:

- [ ] Dev server is running: `npm run dev` (should be on `http://localhost:3000`)
- [ ] Database migrations applied: `npx supabase migration list` shows `001_initial_schema` and `002_add_reviews` both as `Deployed`
- [ ] Create two test Supabase accounts (or use existing ones):
  - **User A** (Alice): e.g., `alice@test.local`
  - **User B** (Bob): e.g., `bob@test.local`
- [ ] Browser: preferably two separate browsers or incognito tabs for testing real-time updates
- [ ] Supabase dashboard open (optional, for DB verification)

---

## 1. Signup (User A: Alice)

- [ ] Navigate to `http://localhost:3000` → redirects to `/login`
- [ ] Click "Sign up here" link → goes to `/signup`
- [ ] **Happy path**: enter name (Alice), email (alice@test.local), password, confirm password → click Sign Up
  - [ ] Success message or redirect to onboarding
  - [ ] Verify Supabase Auth user created (check Supabase dashboard)
- [ ] **Validation**: test required field validation
  - [ ] Try submit with empty name → error appears
  - [ ] Try submit with invalid email → error appears
  - [ ] Try submit with password mismatch → error appears

---

## 2. Login (User B: Bob — via signup or pre-existing account)

- [ ] Sign up Bob with email `bob@test.local` (follow same flow as Alice, or test login with pre-existing account)
- [ ] After signup, you should be in onboarding (Alice) — log out first
  - [ ] Click Settings → [find logout button, or use Supabase dashboard to sign out]
  - OR open incognito/new browser for Bob
- [ ] Navigate to `/login`
- [ ] **Happy path**: enter Bob's email and password → click Log In
  - [ ] Redirects to onboarding (if no household yet) or to `/home` (if household exists)
- [ ] **Validation**: test wrong password
  - [ ] Enter correct email but wrong password → error appears

---

## 3. Household Creation (Onboarding Wizard — Alice)

Log in as Alice if not already in onboarding.

### Step 1: Create Household

- [ ] See form: "Household Name", "Currency", "When does your cycle start?"
- [ ] **Happy path**:
  - [ ] Enter "Alice & Bob" as household name
  - [ ] Select currency (e.g., ARS, USD, EUR, CLP, MXN) — try ARS
  - [ ] Select cycle start day (e.g., 1st of the month or current day)
  - [ ] Click "Next" → goes to Step 2

### Step 2: Select Split Mode

- [ ] See two options: "Equal Split" and "Income-Based Split"
- [ ] **Test Equal Split**:
  - [ ] Select "Equal Split"
  - [ ] Click "Next" → goes to Step 3
  - [ ] (Note: after this flow completes, you can test Income-Based Split with a new household later)

### Step 3: Invite Partner

- [ ] See form: "Partner's Email"
- [ ] **Happy path**:
  - [ ] Enter Bob's email (`bob@test.local`)
  - [ ] Click "Send Invitation"
  - [ ] Success message appears (or page redirects to `/home`)
  - [ ] Verify invitation created in DB: `SELECT * FROM invitations WHERE email = 'bob@test.local'` should show status `pending` and an `expires_at` timestamp
- [ ] You should now be on `/home` as Alice in the new household

---

## 4. Email Invitation (Alice invited Bob)

- [ ] Check if email was sent to Bob:
  - [ ] If Resend API key is configured: check Bob's inbox (or Resend dashboard)
  - [ ] If no Resend key: emails silently fail (expected) — skip to next section
- [ ] Verify email contains:
  - [ ] Household name ("Alice & Bob")
  - [ ] Unique invite link with token (format: `http://localhost:3000/invite/[token]`)
  - [ ] Call to action ("Accept Invitation")

---

## 5. Invitation Acceptance

### Scenario A: Bob (New User) Accepts

- [ ] **As Bob** (logged out or in incognito):
  - [ ] Click the invite link from email → goes to `/invite/[token]`
  - [ ] See invite acceptance page: household name "Alice & Bob" + email `bob@test.local` displayed
  - [ ] If equal split mode: see "Accept & Join" button
  - [ ] If income mode: see "Accept & Join" + income input field
  - [ ] **If not logged in**: see option to log in or sign up
    - [ ] Click "Sign up" → `/signup?inviteToken=...`
    - [ ] Complete signup for Bob
    - [ ] Should auto-redirect back to `/invite/[token]` with "Accept & Join" button
  - [ ] **If already logged in**: directly see "Accept & Join" button
- [ ] Click "Accept & Join"
  - [ ] Success message or redirect to `/home`
  - [ ] Verify in DB: Bob is now a `member` in the household (role = `member`)
  - [ ] Invitation status changed to `accepted`
- [ ] Bob is now on `/home` dashboard

### Scenario B (Optional): Test Accepting as Different User

If you have a third test account (Carol), test:
- [ ] Accept invitation link as a logged-in user who is NOT the invitee
- [ ] Expected: should either accept them into the household (current behavior) or show an error
  - [ ] Document what happens

---

## 6. Settings & Member List

- [ ] **As Alice**, navigate to `/settings`
- [ ] See household info (read-only fields):
  - [ ] Household name: "Alice & Bob"
  - [ ] Currency: ARS (or selected currency)
  - [ ] Cycle start day: 1 (or selected day)
  - [ ] Split mode: "Equal Split"
- [ ] See members list:
  - [ ] Alice (Alice) — role indicator (owner/member)
  - [ ] Bob (bob@test.local) — role indicator
- [ ] **If income mode was selected**: see "Update Monthly Income" form
  - [ ] (For this test, since we selected equal split, this form should NOT appear)

---

## 7. Add Expenses (3+ with Different Payers)

Now add multiple expenses with different payers.

### Expense 1: Alice Pays (Home Quick-Add)

- [ ] **As Alice**, on `/home` dashboard
- [ ] See quick-add form: "Amount", "Who paid?", "Description"
- [ ] Enter:
  - [ ] Amount: 100 (ARS)
  - [ ] Who paid: Alice
  - [ ] Description: "Groceries"
  - [ ] Click "Add Expense"
- [ ] Expense appears in list below
- [ ] Verify in DB: expense created with `paid_by = alice_id`, `amount = 100`

### Expense 2: Bob Pays (Home Quick-Add)

- [ ] Add another via quick-add:
  - [ ] Amount: 200
  - [ ] Who paid: Bob
  - [ ] Description: "Gas"
  - [ ] Click "Add Expense"
- [ ] Expense appears in list

### Expense 3: Alice Pays (Via Full Expenses Page)

- [ ] Navigate to `/expenses`
- [ ] See "Add Expense" form at top
- [ ] Enter:
  - [ ] Amount: 150
  - [ ] Who paid: Alice
  - [ ] Description: "Restaurant"
  - [ ] Click "Add Expense" (or submit button)
- [ ] Expense appears in list with date, amount, payer, description
- [ ] See delete button (X) on each row

### Verification

- [ ] All three expenses visible on `/expenses` list
- [ ] Each expense shows: date, payer name, amount, description, delete button
- [ ] Expenses are sortable by most recent first (or check order)
- [ ] Verify in DB: `SELECT * FROM expenses WHERE household_id = ...` shows 3 rows

---

## 8. Real-Time Balance Display

### Setup: Two Tabs / Two Browsers

- [ ] Open `/home` as Alice in Browser 1
- [ ] Open `/home` as Bob in Browser 2 (log in if needed)
- [ ] Both should show the same balance calculations

### Test: Real-Time Updates

- [ ] **In Browser 1 (Alice)**:
  - [ ] See balance display:
    - [ ] Total expenses so far: 100 + 200 + 150 = 450
    - [ ] Alice paid: 250 (100 + 150)
    - [ ] Bob paid: 200
    - [ ] Alice's share: 225 (50% of 450)
    - [ ] Bob's share: 225 (50% of 450)
    - [ ] Settlement: Bob owes Alice 25 ARS
    - [ ] Split ratio bar showing ~56% Alice (paid) vs ~44% Bob (paid)
- [ ] **In Browser 2 (Bob)**:
  - [ ] See same balance calculations
- [ ] **Add a new expense in Browser 1** (Alice adds a 300 ARS expense, Bob paid):
  - [ ] Instantly, Browser 2 should update with new totals
  - [ ] Total now: 750
  - [ ] Bob paid: 500
  - [ ] Alice paid: 250
  - [ ] Alice's share: 375, Bob's share: 375
  - [ ] Settlement: Alice owes Bob 125
  - [ ] ✅ Verify Realtime works: Browser 2 updates without refresh

### Edge Case: One User Logs Out

- [ ] **In Browser 2 (Bob)**, log out (Settings → Logout or Supabase dashboard)
- [ ] Browser 2 should show login page
- [ ] **In Browser 1 (Alice)**, add another expense
- [ ] Browser 2 is logged out, so no realtime expected (OK)
- [ ] **Re-log Bob into Browser 2**:
  - [ ] Navigate to `/home` as Bob
  - [ ] Balance should show correct totals (fetched fresh)
  - [ ] Realtime subscription should re-establish
- [ ] Document any unexpected behaviors (e.g., stale cache, failed subscription, errors in console)

---

## 9. Notifications / Activity Feed

- [ ] Navigate to `/notifications` as Alice
- [ ] See activity feed:
  - [ ] List of recent actions (expenses added, reviews requested/resolved) in reverse chronological order
  - [ ] Each entry shows: action type (expense/review), actor name, timestamp, amount if applicable
  - [ ] Entries are color-coded: blue (expense), amber (review requested), green (review resolved)
- [ ] **As Bob**, open `/notifications`
  - [ ] See same events in the feed
- [ ] **Back in Alice's browser**, add a new expense via `/expenses`
- [ ] **Watch Bob's `/notifications` page** (real-time subscription):
  - [ ] New expense appears in the feed without page refresh
  - [ ] Color: blue card with expense details
  - [ ] Click on the card → links to the expense detail page

---

## 10. Request Expense Review

### Scenario: Bob Questions Alice's Expense

- [ ] **As Bob**, go to `/expenses` and find Alice's "Groceries" expense (100 ARS)
- [ ] Click on the expense → `/expenses/[id]`
- [ ] See expense detail:
  - [ ] Amount: 100
  - [ ] Paid by: Alice
  - [ ] Date: [date]
  - [ ] Description: "Groceries"
  - [ ] Status badge: (none yet)
  - [ ] **Review Panel**: shows "Ask a Question" button/form
- [ ] Bob clicks "Ask a Question" (or form opens)
- [ ] Enter:
  - [ ] Question: "Can you break down what groceries these were?"
  - [ ] Suggested amount: (leave blank or try 80)
  - [ ] Click "Submit Question"
- [ ] **Verification**:
  - [ ] Expense now shows status badge: "Under review"
  - [ ] Bob sees his question displayed
  - [ ] In DB: `reviews` table has new row with `requested_by = bob_id`, `status = pending`
- [ ] **Email notification** (if Resend configured):
  - [ ] Alice receives email: "Review requested on your expense"
  - [ ] Email contains: expense amount, question, link to respond

---

## 11. Respond to Review

### Scenario: Alice Responds to Bob's Question

- [ ] **As Alice**, go to `/expenses/[id]` (same expense Bob questioned)
- [ ] See expense with status "Under review"
- [ ] See **Review Panel**:
  - [ ] Bob's question displayed
  - [ ] "Respond to Review" form below (only visible if current user is the payer)
  - [ ] Input field for response
- [ ] Enter response: "Sure! $40 on bread & vegetables, $35 on dairy, $25 on meat"
- [ ] Click "Send Response"
- [ ] **Verification**:
  - [ ] Review panel now shows resolved state (green card or similar)
  - [ ] Both question and response visible together
  - [ ] Status badge changes to (none) or "Resolved"
  - [ ] In DB: `reviews` table row has `status = resolved`, response text stored
- [ ] **Email notification** (if Resend configured):
  - [ ] Bob receives email: "Review response received"
  - [ ] Email contains response text and link

---

## 12. Close Cycle

### Current Cycle Status

- [ ] Navigate to `/cycle` as Alice
- [ ] See:
  - [ ] Cycle period: "Mar 1 — Mar 31" (or current month, formatted as "MMM D — MMM D")
  - [ ] Progress bar: percentage of month elapsed
  - [ ] Total expenses count and sum: "4 expenses · ARS 750"
  - [ ] **Close Cycle Modal**:
    - [ ] Shows a preview of the settlement
    - [ ] "Alice paid: 250 · Bob paid: 500"
    - [ ] "Alice owes Bob: 125 ARS"
    - [ ] Two buttons: "Cancel" and "Close Cycle"

### Close the Cycle

- [ ] Click "Close Cycle" button
- [ ] **Expected behavior**:
  - [ ] Modal closes
  - [ ] Current cycle status changes to `closed` in DB
  - [ ] New open cycle created with next month's dates
  - [ ] Expense list resets (previous cycle's expenses no longer visible on `/home`)
  - [ ] `/cycle` now shows new cycle period
  - [ ] Cycle `summary` JSON stored in DB with settlement details
- [ ] **Verify in DB**:
  - [ ] Previous cycle: `status = closed`, `summary` contains settlement calculation
  - [ ] New cycle: `status = open`, correct start/end dates
  - [ ] All previous expenses linked to old cycle
- [ ] **Test Cancel button** (optional, on next cycle test):
  - [ ] Click "Cancel" in CloseCycleModal
  - [ ] Modal should close and cycle should remain open
  - [ ] ⚠️ **Known issue**: Cancel button has no `onClick` handler (may not work)

---

## 13. New Cycle: Add Expenses & Repeat

- [ ] Now in new cycle
- [ ] Add 2-3 new expenses (different payers if possible)
- [ ] Verify balance recalculates from zero
- [ ] Test review workflow on a new expense
- [ ] Document any differences in behavior from first cycle

---

## 14. Cycle History (Expected Gap)

- [ ] Look for `/history` route in the app → navigate to `http://localhost:3000/history`
- [ ] **Expected**: 404 page (route does not exist)
- [ ] **Note**: Cycle history query exists in code (`getCycleHistory` in `queries.ts`), but no UI page implements it
- [ ] Closed cycles are stored in DB but not displayed anywhere in the app
- [ ] Document this as expected limitation

---

## 15. Income-Based Split (Optional Test)

If you want to test the second split mode:

- [ ] **As a new pair of users**, go through onboarding again
- [ ] Step 2: Select "Income-Based Split"
- [ ] After accepting invitation:
  - [ ] Both users see `/settings` with "Update Monthly Income" form
  - [ ] Each user enters their monthly income (e.g., Alice: 3000, Bob: 4000)
  - [ ] Verify splits recalculate: Alice ~43%, Bob ~57%
  - [ ] Verify in DB: `split_percentage` updated for both members
- [ ] Add expenses and verify balance uses income-proportional percentages
- [ ] Document any differences from equal-split mode

---

## 16. Bugs & Unexpected Behaviors Log

Record findings in the table below as you test. Include timestamp, area tested, description, steps to reproduce, and severity.

| # | Timestamp | Area | Description | Steps to Reproduce | Severity | Status |
|---|-----------|------|-------------|-------------------|----------|--------|
| **PRE-1** | — | Security | **Invite token expiry not validated** — `getInvitationByToken` does not check `expires_at`, so expired invites can still be accepted | 1. Manually update `invitations.expires_at` to past date in DB 2. Try to accept the invite 3. Should fail but doesn't | 🔴 HIGH | Open |
| **PRE-2** | — | Auth | **No "Forgot Password" option** — login page has no password recovery, users can get locked out if they forget password | 1. Go to `/login` 2. Look for "Forgot password?" link 3. Does not exist | 🔴 HIGH | Open |
| **PRE-3** | — | UI | Cancel button in CloseCycleModal has no `onClick` handler — clicking it doesn't close the modal | 1. Go to `/cycle` 2. Click "Close Cycle" 3. Click "Cancel" | 🟡 MEDIUM | Open |
| **PRE-4** | — | Feature Gap | Cycle history page not implemented — closed cycles not visible in UI | 1. Close a cycle 2. Try to navigate to `/history` (does not exist) | 🔵 LOW | Expected |
| **PRE-5** | — | Feature Gap | Household settings are read-only — cannot edit name, currency, cycle day, split mode after creation | 1. Go to `/settings` 2. Try to edit household name | 🔵 LOW | Expected |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

**Legend**: 🔴 HIGH (blocks core flow) | 🟡 MEDIUM (feature impaired) | 🔵 LOW (minor/cosmetic)

---

## Final Verification Checklist

After completing all tests:

- [ ] All four pre-logged bugs reviewed and status updated
- [ ] No critical console errors in browser DevTools
- [ ] Supabase logs show no unexpected errors
- [ ] Both users can log in and out cleanly
- [ ] Realtime subscriptions working (balance updates across tabs)
- [ ] Emails sent (if Resend configured) or silently skipped
- [ ] Database integrity: no orphaned records, foreign keys respected
- [ ] All expenses linked to correct cycle
- [ ] Settlements calculated correctly before cycle close
