import { SupabaseClient } from "@supabase/supabase-js";
import {
  Household,
  HouseholdMember,
  Cycle,
  Expense,
  Invitation,
  Review,
} from "@/types";

// Households
export async function createHousehold(
  client: SupabaseClient,
  data: {
    name: string;
    created_by: string;
    currency: string;
    cycle_start_day: number;
    split_mode: "income" | "manual";
  }
) {
  return client.from("households").insert([data]).select().single();
}

export async function getHouseholdsByUser(
  client: SupabaseClient,
  userId: string
) {
  return client
    .from("households")
    .select("*, household_members(*)")
    .or(
      `created_by.eq.${userId},household_members.user_id.eq.${userId}`,
      { referencedTable: "households" }
    );
}

export async function getHouseholdWithMembers(
  client: SupabaseClient,
  householdId: string
) {
  return client
    .from("households")
    .select("*, household_members(*)")
    .eq("id", householdId)
    .single();
}

// Household Members
export async function addHouseholdMember(
  client: SupabaseClient,
  data: {
    household_id: string;
    user_id: string;
    name: string;
    split_percentage: number;
    role: "owner" | "member";
  }
) {
  return client.from("household_members").insert([data]).select().single();
}

export async function updateHouseholdMember(
  client: SupabaseClient,
  memberId: string,
  data: Partial<HouseholdMember>
) {
  return client
    .from("household_members")
    .update(data)
    .eq("id", memberId)
    .select()
    .single();
}

// Cycles
export async function createCycle(
  client: SupabaseClient,
  data: {
    household_id: string;
    start_date: string;
    end_date: string;
  }
) {
  return client
    .from("cycles")
    .insert([{ ...data, status: "open" }])
    .select()
    .single();
}

export async function getActiveCycle(
  client: SupabaseClient,
  householdId: string
) {
  return client
    .from("cycles")
    .select("*")
    .eq("household_id", householdId)
    .eq("status", "open")
    .order("start_date", { ascending: false })
    .single();
}

export async function closeCycle(
  client: SupabaseClient,
  cycleId: string,
  closedBy: string,
  summary: Record<string, unknown>
) {
  return client
    .from("cycles")
    .update({ status: "closed", closed_at: new Date().toISOString(), closed_by: closedBy, summary })
    .eq("id", cycleId)
    .select()
    .single();
}

export async function getCycleHistory(
  client: SupabaseClient,
  householdId: string,
  limit: number = 12
) {
  return client
    .from("cycles")
    .select("*")
    .eq("household_id", householdId)
    .eq("status", "closed")
    .order("end_date", { ascending: false })
    .limit(limit);
}

// Expenses
export async function createExpense(
  client: SupabaseClient,
  data: {
    cycle_id: string;
    household_id: string;
    paid_by: string;
    amount: number;
    description?: string;
    date: string;
  }
) {
  return client.from("expenses").insert([data]).select().single();
}

export async function getExpensesByCycle(
  client: SupabaseClient,
  cycleId: string
) {
  return client
    .from("expenses")
    .select("*")
    .eq("cycle_id", cycleId)
    .order("date", { ascending: false });
}

export async function updateExpense(
  client: SupabaseClient,
  expenseId: string,
  data: Partial<Expense>
) {
  return client
    .from("expenses")
    .update(data)
    .eq("id", expenseId)
    .select()
    .single();
}

export async function deleteExpense(
  client: SupabaseClient,
  expenseId: string
) {
  return client.from("expenses").delete().eq("id", expenseId);
}

// Invitations
export async function createInvitation(
  client: SupabaseClient,
  data: {
    household_id: string;
    email: string;
    token: string;
  }
) {
  return client.from("invitations").insert([data]).select().single();
}

export async function getInvitationByToken(
  client: SupabaseClient,
  token: string
) {
  return client
    .from("invitations")
    .select("*, households(*)")
    .eq("token", token)
    .eq("status", "pending")
    .single();
}

export async function acceptInvitation(
  client: SupabaseClient,
  invitationId: string
) {
  return client
    .from("invitations")
    .update({ status: "accepted" })
    .eq("id", invitationId)
    .select()
    .single();
}

// Reviews
export async function createReview(
  client: SupabaseClient,
  data: {
    expense_id: string;
    requested_by: string;
    question: string;
    suggested_amount?: number;
  }
) {
  return client.from("reviews").insert([data]).select().single();
}

export async function getReviewByExpenseId(
  client: SupabaseClient,
  expenseId: string
) {
  return client
    .from("reviews")
    .select("*")
    .eq("expense_id", expenseId)
    .eq("status", "pending")
    .single();
}

export async function resolveReview(
  client: SupabaseClient,
  reviewId: string,
  data: {
    response: string;
    suggested_amount?: number;
  }
) {
  return client
    .from("reviews")
    .update({
      ...data,
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();
}
