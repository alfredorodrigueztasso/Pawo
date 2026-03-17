-- Rename household concept to space

-- 1. Drop old RLS policies
DROP POLICY IF EXISTS "households_select" ON households;
DROP POLICY IF EXISTS "households_insert" ON households;
DROP POLICY IF EXISTS "households_update" ON households;
DROP POLICY IF EXISTS "members_select" ON household_members;
DROP POLICY IF EXISTS "members_insert" ON household_members;
DROP POLICY IF EXISTS "members_update" ON household_members;
DROP POLICY IF EXISTS "cycles_select" ON cycles;
DROP POLICY IF EXISTS "cycles_insert" ON cycles;
DROP POLICY IF EXISTS "cycles_update" ON cycles;
DROP POLICY IF EXISTS "expenses_select" ON expenses;
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
DROP POLICY IF EXISTS "expenses_update" ON expenses;
DROP POLICY IF EXISTS "expenses_delete" ON expenses;
DROP POLICY IF EXISTS "invitations_insert" ON invitations;
DROP POLICY IF EXISTS "invitations_update" ON invitations;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;

-- 2. Drop the old SECURITY DEFINER function
DROP FUNCTION IF EXISTS get_my_household_ids();

-- 3. Rename tables
ALTER TABLE households RENAME TO spaces;
ALTER TABLE household_members RENAME TO space_members;

-- 4. Rename columns: household_id → space_id in affected tables
ALTER TABLE space_members RENAME COLUMN household_id TO space_id;
ALTER TABLE cycles RENAME COLUMN household_id TO space_id;
ALTER TABLE expenses RENAME COLUMN household_id TO space_id;
ALTER TABLE invitations RENAME COLUMN household_id TO space_id;

-- 5. Rename indexes
ALTER INDEX idx_households_created_by RENAME TO idx_spaces_created_by;
ALTER INDEX idx_household_members_household RENAME TO idx_space_members_space;
ALTER INDEX idx_household_members_user RENAME TO idx_space_members_user;
ALTER INDEX idx_cycles_household RENAME TO idx_cycles_space;
ALTER INDEX idx_expenses_household RENAME TO idx_expenses_space;
ALTER INDEX idx_invitations_household RENAME TO idx_invitations_space;

-- 6. Rename trigger
ALTER TRIGGER households_updated_at ON spaces RENAME TO spaces_updated_at;

-- 7. Recreate SECURITY DEFINER function with new name
CREATE OR REPLACE FUNCTION get_my_space_ids()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
$$;

-- 8. Recreate all RLS policies using new names
-- spaces
CREATE POLICY "spaces_select" ON spaces FOR SELECT
  USING (auth.uid() = created_by OR id IN (SELECT get_my_space_ids()));

CREATE POLICY "spaces_insert" ON spaces FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "spaces_update" ON spaces FOR UPDATE
  USING (auth.uid() = created_by);

-- space_members: see all members in your spaces
CREATE POLICY "members_select" ON space_members FOR SELECT
  USING (space_id IN (SELECT get_my_space_ids()) OR auth.uid() = user_id);

CREATE POLICY "members_insert" ON space_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_update" ON space_members FOR UPDATE
  USING (auth.uid() = user_id);

-- cycles
CREATE POLICY "cycles_select" ON cycles FOR SELECT
  USING (space_id IN (SELECT get_my_space_ids()));

CREATE POLICY "cycles_insert" ON cycles FOR INSERT
  WITH CHECK (space_id IN (SELECT get_my_space_ids()));

CREATE POLICY "cycles_update" ON cycles FOR UPDATE
  USING (space_id IN (SELECT get_my_space_ids()));

-- expenses
CREATE POLICY "expenses_select" ON expenses FOR SELECT
  USING (space_id IN (SELECT get_my_space_ids()));

CREATE POLICY "expenses_insert" ON expenses FOR INSERT
  WITH CHECK (space_id IN (SELECT get_my_space_ids()));

CREATE POLICY "expenses_update" ON expenses FOR UPDATE
  USING (space_id IN (SELECT get_my_space_ids()));

CREATE POLICY "expenses_delete" ON expenses FOR DELETE
  USING (paid_by = auth.uid() OR
    space_id IN (SELECT id FROM public.spaces WHERE created_by = auth.uid()));

-- invitations: open SELECT needed for unauthenticated invite token lookup
CREATE POLICY "invitations_insert" ON invitations FOR INSERT
  WITH CHECK (space_id IN (SELECT get_my_space_ids()));

CREATE POLICY "invitations_update" ON invitations FOR UPDATE
  USING (space_id IN (SELECT get_my_space_ids()));

-- reviews
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  USING (expense_id IN (
    SELECT id FROM public.expenses WHERE space_id IN (SELECT get_my_space_ids())
  ));

CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  WITH CHECK (expense_id IN (
    SELECT id FROM public.expenses WHERE space_id IN (SELECT get_my_space_ids())
  ));

CREATE POLICY "reviews_update" ON reviews FOR UPDATE
  USING (expense_id IN (
    SELECT id FROM public.expenses WHERE space_id IN (SELECT get_my_space_ids())
  ));
