-- Create households table
CREATE TABLE households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  cycle_start_day INTEGER NOT NULL CHECK (cycle_start_day >= 1 AND cycle_start_day <= 28),
  split_mode TEXT NOT NULL CHECK (split_mode IN ('income', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create household_members table
CREATE TABLE household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  monthly_income DECIMAL(12, 2),
  split_percentage DECIMAL(5, 2) NOT NULL CHECK (split_percentage >= 0 AND split_percentage <= 100),
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Create cycles table
CREATE TABLE cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
  summary JSONB,
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(household_id, start_date)
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL,
  split_override JSONB,
  review_requested_by UUID,
  review_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invitations table
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '7 days'
);

-- Create indexes for better query performance
CREATE INDEX idx_households_created_by ON households(created_by);
CREATE INDEX idx_household_members_household ON household_members(household_id);
CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_cycles_household ON cycles(household_id);
CREATE INDEX idx_cycles_status ON cycles(status);
CREATE INDEX idx_expenses_cycle ON expenses(cycle_id);
CREATE INDEX idx_expenses_household ON expenses(household_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_invitations_household ON invitations(household_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Create triggers to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER households_updated_at
BEFORE UPDATE ON households
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
