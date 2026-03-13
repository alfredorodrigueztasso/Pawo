export interface Household {
  id: string;
  name: string;
  created_by: string;
  currency: string;
  cycle_start_day: number;
  split_mode: 'income' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  name: string;
  monthly_income?: number;
  split_percentage: number;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface Cycle {
  id: string;
  household_id: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed';
  summary?: Record<string, unknown>;
  closed_at?: string;
  closed_by?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  cycle_id: string;
  household_id: string;
  paid_by: string;
  amount: number;
  description?: string;
  date: string;
  split_override?: Record<string, number>;
  review_requested_by?: string;
  review_note?: string;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  household_id: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

export interface Review {
  id: string;
  expense_id: string;
  requested_by: string;
  status: 'pending' | 'resolved';
  question: string;
  suggested_amount?: number;
  response?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}
