import { SupabaseClient } from "@supabase/supabase-js";
import { Holding } from "../../types/portfolio";

export async function getHoldings(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Holding[];
}

export async function getHolding(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Holding;
}

export async function createHolding(
  supabase: SupabaseClient,
  holding: Omit<Holding, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("holdings")
    .insert(holding)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Holding;
}

export async function updateHolding(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Holding>
) {
  const { data, error } = await supabase
    .from("holdings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Holding;
}

export async function deleteHolding(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("holdings").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
