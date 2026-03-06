import type { Card } from "@/lib/cards/types";
import { supabase } from "@/lib/supabase";
import cardsJson from "./cards.json";

// Static JSON fallback (used as default until Supabase loads)
export const cards: Card[] = cardsJson as Card[];

// --- Sync helpers (operate on whatever card array is passed in) ---

export function getCardById(id: string, source: Card[] = cards): Card | undefined {
  return source.find((c) => c.id === id);
}

export function getLegends(source: Card[] = cards): Card[] {
  return source.filter((c) => c.card_type === "legend");
}

export function getNonLegends(source: Card[] = cards): Card[] {
  return source.filter((c) => c.card_type !== "legend");
}

export function getPrintings(name: string, source: Card[] = cards): Card[] {
  return source.filter((c) => c.name === name);
}

export function getUniqueCards(source: Card[] = cards): Card[] {
  const seen = new Map<string, Card>();
  for (const card of source) {
    const existing = seen.get(card.name);
    if (!existing || (card.printing === "standard" && existing.printing !== "standard")) {
      seen.set(card.name, card);
    }
  }
  return Array.from(seen.values());
}

// --- Async Supabase fetchers (for server components) ---

export async function fetchAllCards(): Promise<Card[]> {
  const { data, error } = await supabase.from("cards").select("*");
  if (error || !data) return cards;
  return data as Card[];
}

export async function fetchCardById(id: string): Promise<Card | undefined> {
  const { data, error } = await supabase.from("cards").select("*").eq("id", id).single();
  if (error || !data) return getCardById(id);
  return data as Card;
}
