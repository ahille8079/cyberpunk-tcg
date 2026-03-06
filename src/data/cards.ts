import type { Card } from "@/lib/cards/types";
import cardsJson from "./cards.json";

// Static JSON — single source of truth for card data
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
