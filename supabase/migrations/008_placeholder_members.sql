-- Migration 008: Support placeholder members for simplified invitation flow
-- Allows creating members before invitation acceptance, enabling immediate expense assignment

-- space_members: make user_id nullable and add placeholder fields
ALTER TABLE space_members ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE space_members ADD COLUMN IF NOT EXISTS invited_email TEXT;
ALTER TABLE space_members ADD COLUMN IF NOT EXISTS placeholder_id UUID;
ALTER TABLE space_members ADD COLUMN IF NOT EXISTS is_placeholder BOOLEAN NOT NULL DEFAULT FALSE;

-- invitations: store partner name from invite flow
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS partner_name TEXT;

-- RLS Policies: Allow owner to insert any member into their space
DROP POLICY IF EXISTS "members_insert" ON space_members;
CREATE POLICY "members_insert" ON space_members FOR INSERT
  WITH CHECK (space_id IN (SELECT id FROM public.spaces WHERE created_by = auth.uid()));

-- RLS Policies: Allow owner to update members, and allow users to claim their placeholder
DROP POLICY IF EXISTS "members_update" ON space_members;
CREATE POLICY "members_update" ON space_members FOR UPDATE
  USING (
    auth.uid() = user_id
    OR space_id IN (SELECT id FROM public.spaces WHERE created_by = auth.uid())
  );

-- RLS Policies: Restore SELECT policy on invitations (was dropped in migration 004)
CREATE POLICY IF NOT EXISTS "invitations_select" ON invitations FOR SELECT USING (true);

-- RLS Policies: Fix expenses_delete to allow owner to delete any expense in their space
DROP POLICY IF EXISTS "expenses_delete" ON expenses;
CREATE POLICY "expenses_delete" ON expenses FOR DELETE
  USING (
    space_id IN (SELECT id FROM public.spaces WHERE created_by = auth.uid())
    OR space_id IN (SELECT get_my_space_ids())
  );
