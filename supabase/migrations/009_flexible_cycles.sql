-- Migration 009: Support flexible cycle cadences (weekly, biweekly, custom duration)
-- Enables creation of cycles with custom durations, not just monthly

-- Add new columns to spaces table
ALTER TABLE spaces
  ADD COLUMN cycle_type TEXT NOT NULL DEFAULT 'monthly'
    CHECK (cycle_type IN ('weekly', 'biweekly', 'monthly', 'custom')),
  ADD COLUMN cycle_duration_days INTEGER;

-- Make cycle_start_day nullable (only needed for monthly cycles)
ALTER TABLE spaces
  ALTER COLUMN cycle_start_day DROP NOT NULL;

-- Add validation constraints
ALTER TABLE spaces
  ADD CONSTRAINT check_custom_duration
    CHECK (cycle_type != 'custom' OR (cycle_duration_days IS NOT NULL AND cycle_duration_days >= 2)),
  ADD CONSTRAINT check_start_day_for_monthly
    CHECK (cycle_type != 'monthly' OR (cycle_start_day IS NOT NULL AND cycle_start_day >= 1 AND cycle_start_day <= 28));
