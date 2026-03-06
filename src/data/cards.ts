import type { Card } from "@/lib/cards/types";
import cardsJson from "./cards.json";

export const cards: Card[] = cardsJson as Card[];

export function getCardById(id: string): Card | undefined {
  return cards.find((c) => c.id === id);
}

export function getLegends(): Card[] {
  return cards.filter((c) => c.card_type === "legend");
}

export function getNonLegends(): Card[] {
  return cards.filter((c) => c.card_type !== "legend");
}

/** Get all printings of a card by its name */
export function getPrintings(name: string): Card[] {
  return cards.filter((c) => c.name === name);
}

/**
 * Get one card per unique name, preferring standard printing.
 * Used by the card grid to deduplicate variants.
 */
export function getUniqueCards(): Card[] {
  const seen = new Map<string, Card>();
  for (const card of cards) {
    const existing = seen.get(card.name);
    if (!existing || (card.printing === "standard" && existing.printing !== "standard")) {
      seen.set(card.name, card);
    }
  }
  return Array.from(seen.values());
}
