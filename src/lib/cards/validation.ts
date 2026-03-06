import type { Card, DeckCard, DeckValidation, DeckStats } from "./types";
import { DECK_MIN_CARDS, DECK_MAX_CARDS, MAX_COPIES, MAX_LEGENDS } from "../utils";

export function validateDeck(
  legends: Card[],
  deckCards: DeckCard[],
  allCards: Card[]
): DeckValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Resolve deck cards to full card objects
  const resolvedCards = deckCards
    .map((dc) => {
      const card = allCards.find((c) => c.id === dc.card_id);
      return card ? { ...card, quantity: dc.quantity } : null;
    })
    .filter((c): c is Card & { quantity: number } => c !== null);

  // Total card count
  const totalCards = resolvedCards.reduce((sum, c) => sum + c.quantity, 0);

  // Validate legends
  if (legends.length !== MAX_LEGENDS) {
    errors.push(`Deck must have exactly ${MAX_LEGENDS} Legends (currently ${legends.length})`);
  }

  const legendIds = new Set(legends.map((l) => l.id));
  if (legendIds.size !== legends.length) {
    errors.push("All 3 Legends must be different");
  }

  // Validate card count
  if (totalCards < DECK_MIN_CARDS) {
    errors.push(`Deck must have at least ${DECK_MIN_CARDS} cards (currently ${totalCards})`);
  }
  if (totalCards > DECK_MAX_CARDS) {
    errors.push(`Deck must have at most ${DECK_MAX_CARDS} cards (currently ${totalCards})`);
  }

  // Validate max copies
  for (const dc of deckCards) {
    if (dc.quantity > MAX_COPIES) {
      const card = allCards.find((c) => c.id === dc.card_id);
      errors.push(`${card?.name ?? "Unknown card"} exceeds max ${MAX_COPIES} copies (has ${dc.quantity})`);
    }
  }

  // Calculate RAM budget by color
  const ramBudgetByColor: Record<string, { provided: number; used: number }> = {};

  for (const legend of legends) {
    const color = legend.color;
    if (!ramBudgetByColor[color]) {
      ramBudgetByColor[color] = { provided: 0, used: 0 };
    }
    ramBudgetByColor[color].provided += legend.ram_provided ?? 0;
  }

  for (const card of resolvedCards) {
    const color = card.color;
    if (!ramBudgetByColor[color]) {
      ramBudgetByColor[color] = { provided: 0, used: 0 };
    }
    ramBudgetByColor[color].used += (card.ram_cost ?? 0) * card.quantity;
  }

  // Check RAM budget overages
  for (const [color, budget] of Object.entries(ramBudgetByColor)) {
    if (budget.used > budget.provided && budget.provided > 0) {
      errors.push(`${color} RAM budget exceeded: using ${budget.used}/${budget.provided}`);
    }
    if (budget.used > 0 && budget.provided === 0) {
      errors.push(`No ${color} RAM provided by Legends but ${budget.used} RAM used by ${color} cards`);
    }
  }

  // Calculate eddie cost curve
  const eddieCostCurve: Record<number, number> = {};
  for (const card of resolvedCards) {
    const cost = card.eddie_cost;
    eddieCostCurve[cost] = (eddieCostCurve[cost] ?? 0) + card.quantity;
  }

  // Card type distribution
  const cardTypeDistribution: Record<string, number> = {};
  for (const card of resolvedCards) {
    cardTypeDistribution[card.card_type] =
      (cardTypeDistribution[card.card_type] ?? 0) + card.quantity;
  }

  // Sell tag ratio
  const sellTagCount = resolvedCards
    .filter((c) => c.has_sell_tag)
    .reduce((sum, c) => sum + c.quantity, 0);
  const sellTagRatio = totalCards > 0 ? sellTagCount / totalCards : 0;

  if (sellTagRatio < 0.3 && totalCards > 0) {
    warnings.push(
      `Only ${Math.round(sellTagRatio * 100)}% of cards have Sell Tags (recommend 30%+)`
    );
  }

  // Blocker count
  const blockerCount = resolvedCards
    .filter((c) => c.keywords.some((k) => k.toLowerCase() === "blocker"))
    .reduce((sum, c) => sum + c.quantity, 0);

  if (blockerCount < 4 && totalCards > 0) {
    warnings.push(`Low Blocker count: ${blockerCount} (recommend 4+)`);
  }

  // Power breakpoints
  const powerBreakpoints = { below5: 0, from5to9: 0, from10plus: 0 };
  for (const card of resolvedCards) {
    if (card.power != null) {
      const count = card.quantity;
      if (card.power < 5) powerBreakpoints.below5 += count;
      else if (card.power < 10) powerBreakpoints.from5to9 += count;
      else powerBreakpoints.from10plus += count;
    }
  }

  const stats: DeckStats = {
    totalCards,
    ramBudgetByColor,
    eddieCostCurve,
    cardTypeDistribution,
    sellTagRatio,
    blockerCount,
    powerBreakpoints,
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}
