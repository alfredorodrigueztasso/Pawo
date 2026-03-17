import { SupabaseClient } from "@supabase/supabase-js";
import {
  Space,
  SpaceMember,
  Cycle,
  Expense,
  Invitation,
  Review,
} from "@/types";

// Profiles
export async function getProfile(client: SupabaseClient, userId: string) {
  return client
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();
}

// Spaces
export async function createSpace(
  client: SupabaseClient,
  data: {
    name: string;
    created_by: string;
    currency: string;
    cycle_start_day: number;
    split_mode: "income" | "manual";
  }
) {
  return client.from("spaces").insert([data]).select().single();
}

export async function getSpaceWithMembers(
  client: SupabaseClient,
  spaceId: string
) {
  return client
    .from("spaces")
    .select("*, space_members(*)")
    .eq("id", spaceId)
    .single();
}

// Space Members
export async function addSpaceMember(
  client: SupabaseClient,
  data: {
    space_id: string;
    user_id: string;
    name: string;
    split_percentage: number;
    role: "owner" | "member";
  }
) {
  return client.from("space_members").insert([data]).select().single();
}

export async function updateSpaceMember(
  client: SupabaseClient,
  memberId: string,
  data: Partial<SpaceMember>
) {
  return client
    .from("space_members")
    .update(data)
    .eq("id", memberId)
    .select()
    .single();
}

// Cycles
export async function createCycle(
  client: SupabaseClient,
  data: {
    space_id: string;
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
  spaceId: string
) {
  return client
    .from("cycles")
    .select("*")
    .eq("space_id", spaceId)
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
  spaceId: string,
  limit: number = 12
) {
  return client
    .from("cycles")
    .select("*")
    .eq("space_id", spaceId)
    .eq("status", "closed")
    .order("end_date", { ascending: false })
    .limit(limit);
}

// Expenses
export async function createExpense(
  client: SupabaseClient,
  data: {
    cycle_id: string;
    space_id: string;
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
    space_id: string;
    email: string;
    token: string;
  }
) {
  return client
    .from("invitations")
    .insert([{ ...data, status: "pending" }])
    .select()
    .single();
}

export async function getInvitationByToken(
  client: SupabaseClient,
  token: string
) {
  return client
    .from("invitations")
    .select("*, spaces(*)")
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
