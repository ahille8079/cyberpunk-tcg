import type { SupabaseClient } from "@supabase/supabase-js";
import type { StashCard } from "@/lib/cards/types";

/** Fetch all stash cards for a user. */
export async function getStash(
  supabase: SupabaseClient,
  userId: string
): Promise<StashCard[]> {
  const { data, error } = await supabase
    .from("stash_cards")
    .select("card_id, quantity")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    card_id: row.card_id,
    quantity: row.quantity,
  }));
}

/** Add or update a card in the user's stash. Removes if quantity <= 0. */
export async function upsertStashCard(
  supabase: SupabaseClient,
  userId: string,
  cardId: string,
  quantity: number
): Promise<void> {
  if (quantity <= 0) {
    return removeStashCard(supabase, userId, cardId);
  }

  const { error } = await supabase.from("stash_cards").upsert(
    {
      user_id: userId,
      card_id: cardId,
      quantity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,card_id" }
  );

  if (error) throw error;
}

/** Remove a card from the user's stash. */
export async function removeStashCard(
  supabase: SupabaseClient,
  userId: string,
  cardId: string
): Promise<void> {
  const { error } = await supabase
    .from("stash_cards")
    .delete()
    .eq("user_id", userId)
    .eq("card_id", cardId);

  if (error) throw error;
}

/** Clear all cards from the user's stash. */
export async function clearStash(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("stash_cards")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
