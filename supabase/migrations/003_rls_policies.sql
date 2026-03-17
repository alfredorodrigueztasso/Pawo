-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER helper: queries household_members without triggering RLS
-- This breaks the circular dependency between households_select and members_select
CREATE OR REPLACE FUNCTION get_my_household_ids()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
$$;

-- households
CREATE POLICY "households_select" ON households FOR SELECT
  USING (auth.uid() = created_by OR id IN (SELECT get_my_household_ids()));

CREATE POLICY "households_insert" ON households FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "households_update" ON households FOR UPDATE
  USING (auth.uid() = created_by);

-- household_members: see all members in your households
CREATE POLICY "members_select" ON household_members FOR SELECT
  USING (household_id IN (SELECT get_my_household_ids()) OR auth.uid() = user_id);

CREATE POLICY "members_insert" ON household_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_update" ON household_members FOR UPDATE
  USING (auth.uid() = user_id);

-- cycles
CREATE POLICY "cycles_select" ON cycles FOR SELECT
  USING (household_id IN (SELECT get_my_household_ids()));

CREATE POLICY "cycles_insert" ON cycles FOR INSERT
  WITH CHECK (household_id IN (SELECT get_my_household_ids()));

CREATE POLICY "cycles_update" ON cycles FOR UPDATE
  USING (household_id IN (SELECT get_my_household_ids()));

-- expenses
CREATE POLICY "expenses_select" ON expenses FOR SELECT
  USING (household_id IN (SELECT get_my_household_ids()));

CREATE POLICY "expenses_insert" ON expenses FOR INSERT
  WITH CHECK (household_id IN (SELECT get_my_household_ids()));

CREATE POLICY "expenses_update" ON expenses FOR UPDATE
  USING (household_id IN (SELECT get_my_household_ids()));

CREATE POLICY "expenses_delete" ON expenses FOR DELETE
  USING (paid_by = auth.uid() OR
    household_id IN (SELECT id FROM public.households WHERE created_by = auth.uid()));

-- invitations: open SELECT needed for unauthenticated invite token lookup
CREATE POLICY "invitations_select" ON invitations FOR SELECT
  USING (true);

CREATE POLICY "invitations_insert" ON invitations FOR INSERT
  WITH CHECK (household_id IN (SELECT get_my_household_ids()));

CREATE POLICY "invitations_update" ON invitations FOR UPDATE
  USING (household_id IN (SELECT get_my_household_ids()));

-- reviews
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  USING (expense_id IN (
    SELECT id FROM public.expenses WHERE household_id IN (SELECT get_my_household_ids())
  ));

CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  WITH CHECK (expense_id IN (
    SELECT id FROM public.expenses WHERE household_id IN (SELECT get_my_household_ids())
  ));

CREATE POLICY "reviews_update" ON reviews FOR UPDATE
  USING (expense_id IN (
    SELECT id FROM public.expenses WHERE household_id IN (SELECT get_my_household_ids())
  ));
