export interface Space {
  id: string;
  name: string;
  created_by: string;
  currency: string;
  cycle_start_day: number | null;
  cycle_type: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  cycle_duration_days: number | null;
  split_mode: 'income' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string | null;
  placeholder_id?: string | null;
  name: string;
  invited_email?: string | null;
  is_placeholder: boolean;
  monthly_income?: number;
  split_percentage: number;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface Cycle {
  id: string;
  space_id: string;
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
  space_id: string;
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
  space_id: string;
  email: string;
  token: string;
  partner_name?: string | null;
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
