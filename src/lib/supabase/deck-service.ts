import type { SupabaseClient } from "@supabase/supabase-js";
import type { Deck, DeckCard } from "@/lib/cards/types";

/** Save (upsert) a deck to the cloud. Returns the deck id. */
export async function saveCloudDeck(
  supabase: SupabaseClient,
  deck: Deck,
  userId: string
): Promise<string> {
  const { data, error: deckError } = await supabase
    .from("decks")
    .upsert(
      {
        id: deck.id,
        user_id: userId,
        name: deck.name || "Untitled Deck",
        description: deck.description,
        legend_1_id: deck.legend_1_id,
        legend_2_id: deck.legend_2_id,
        legend_3_id: deck.legend_3_id,
        is_public: deck.is_public,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("id")
    .single();

  if (deckError) throw deckError;
  const deckId = data.id as string;

  // Replace deck_cards: delete existing, then insert new
  await supabase.from("deck_cards").delete().eq("deck_id", deckId);

  if (deck.cards.length > 0) {
    const rows = deck.cards.map((c) => ({
      deck_id: deckId,
      card_id: c.card_id,
      quantity: c.quantity,
    }));
    const { error: cardsError } = await supabase
      .from("deck_cards")
      .insert(rows);
    if (cardsError) throw cardsError;
  }

  return deckId;
}

/** Fetch all decks for a user. */
export async function getCloudDecks(
  supabase: SupabaseClient,
  userId: string
): Promise<Deck[]> {
  const { data: decks, error } = await supabase
    .from("decks")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!decks || decks.length === 0) return [];

  // Fetch all deck_cards for these decks in one query
  const deckIds = decks.map((d) => d.id);
  const { data: deckCards, error: cardsError } = await supabase
    .from("deck_cards")
    .select("deck_id, card_id, quantity")
    .in("deck_id", deckIds);

  if (cardsError) throw cardsError;

  // Group cards by deck
  const cardsByDeck = new Map<string, DeckCard[]>();
  for (const row of deckCards ?? []) {
    const list = cardsByDeck.get(row.deck_id) ?? [];
    list.push({ card_id: row.card_id, quantity: row.quantity });
    cardsByDeck.set(row.deck_id, list);
  }

  return decks.map((d) => ({
    id: d.id,
    user_id: d.user_id,
    name: d.name,
    description: d.description,
    legend_1_id: d.legend_1_id,
    legend_2_id: d.legend_2_id,
    legend_3_id: d.legend_3_id,
    cards: cardsByDeck.get(d.id) ?? [],
    is_public: d.is_public,
    created_at: d.created_at,
    updated_at: d.updated_at,
  }));
}

/** Fetch a single deck by ID. */
export async function getCloudDeck(
  supabase: SupabaseClient,
  deckId: string
): Promise<Deck | null> {
  const { data: deck, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", deckId)
    .single();

  if (error || !deck) return null;

  const { data: deckCards } = await supabase
    .from("deck_cards")
    .select("card_id, quantity")
    .eq("deck_id", deckId);

  return {
    id: deck.id,
    user_id: deck.user_id,
    name: deck.name,
    description: deck.description,
    legend_1_id: deck.legend_1_id,
    legend_2_id: deck.legend_2_id,
    legend_3_id: deck.legend_3_id,
    cards: (deckCards ?? []).map((c) => ({
      card_id: c.card_id,
      quantity: c.quantity,
    })),
    is_public: deck.is_public,
    created_at: deck.created_at,
    updated_at: deck.updated_at,
  };
}

/** Delete a deck. Cascade deletes deck_cards automatically. */
export async function deleteCloudDeck(
  supabase: SupabaseClient,
  deckId: string
): Promise<void> {
  const { error } = await supabase.from("decks").delete().eq("id", deckId);
  if (error) throw error;
}
