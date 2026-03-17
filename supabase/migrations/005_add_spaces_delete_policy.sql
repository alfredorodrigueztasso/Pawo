-- Add DELETE policy for spaces table
-- Allows space creators (owners) to delete their spaces

CREATE POLICY "spaces_delete" ON spaces FOR DELETE
  USING (auth.uid() = created_by);
