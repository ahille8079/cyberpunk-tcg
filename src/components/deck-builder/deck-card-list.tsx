"use client";

import type { Card, DeckCard } from "@/lib/cards/types";
import { cn, COLOR_HEX, MAX_COPIES } from "@/lib/utils";

interface DeckCardListProps {
  legends: Card[];
  deckCards: DeckCard[];
  allCards: Card[];
  onRemoveCard: (cardId: string) => void;
  onChangeQuantity: (cardId: string, quantity: number) => void;
  onRemoveLegend: (cardId: string) => void;
}

export function DeckCardList({
  legends,
  deckCards,
  allCards,
  onRemoveCard,
  onChangeQuantity,
  onRemoveLegend,
}: DeckCardListProps) {
  // Resolve and group cards by type
  const resolvedCards = deckCards
    .map((dc) => {
      const card = allCards.find((c) => c.id === dc.card_id);
      return card ? { ...card, quantity: dc.quantity } : null;
    })
    .filter((c): c is Card & { quantity: number } => c !== null);

  const grouped = resolvedCards.reduce(
    (acc, card) => {
      const type = card.card_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(card);
      return acc;
    },
    {} as Record<string, (Card & { quantity: number })[]>
  );

  // Sort within groups by eddie_cost
  for (const group of Object.values(grouped)) {
    group.sort((a, b) => a.eddie_cost - b.eddie_cost);
  }

  const totalCards = resolvedCards.reduce((sum, c) => sum + c.quantity, 0);
  const typeOrder = ["unit", "gear", "program"];

  return (
    <div className="space-y-3" data-testid="deck-card-list">
      {/* Legends */}
      <div>
        <h3 className="text-xs font-mono uppercase text-cyber-light/50 mb-2">
          Legends
        </h3>
        <div className="space-y-1">
          {[0, 1, 2].map((i) => {
            const legend = legends[i];
            if (!legend) {
              return (
                <div
                  key={i}
                  className="px-3 py-2 border border-dashed border-cyber-grey/50 rounded text-xs text-cyber-light/20 font-mono"
                >
                  Empty legend slot
                </div>
              );
            }
            const colorHex = COLOR_HEX[legend.color] ?? "#d1d5db";
            return (
              <div
                key={legend.id}
                className="flex items-center gap-2 px-3 py-2 bg-cyber-dark/50 rounded border-l-2"
                style={{ borderLeftColor: colorHex }}
              >
                <span className="text-sm font-bold text-cyber-light flex-1">
                  {legend.name}
                </span>
                <span className="text-xs font-mono text-cyber-cyan">
                  +{legend.ram_provided}R
                </span>
                <button
                  onClick={() => onRemoveLegend(legend.id)}
                  className="text-cyber-light/30 hover:text-cyber-magenta text-xs"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cards by type */}
      {typeOrder.map((type) => {
        const cards = grouped[type];
        if (!cards?.length) return null;

        return (
          <div key={type}>
            <h3 className="text-xs font-mono uppercase text-cyber-light/50 mb-1.5 flex items-center justify-between">
              <span>{type}s</span>
              <span className="text-cyber-light/30">
                {cards.reduce((s, c) => s + c.quantity, 0)}
              </span>
            </h3>
            <div className="space-y-0.5">
              {cards.map((card) => {
                const colorHex = COLOR_HEX[card.color] ?? "#d1d5db";
                return (
                  <div
                    key={card.id}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-cyber-dark/30 rounded group hover:bg-cyber-dark/50"
                  >
                    {/* Quantity buttons */}
                    <div className="flex gap-px">
                      {[1, 2, 3].map((q) => (
                        <button
                          key={q}
                          onClick={() => onChangeQuantity(card.id, q)}
                          className={cn(
                            "w-7 h-7 sm:w-5 sm:h-5 text-xs sm:text-[10px] font-mono rounded-sm transition-colors",
                            q <= card.quantity
                              ? "bg-cyber-grey text-cyber-light"
                              : "text-cyber-light/20 hover:text-cyber-light/40"
                          )}
                          disabled={q > MAX_COPIES}
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Card name */}
                    <span
                      className="text-xs text-cyber-light flex-1 truncate"
                      style={{ color: colorHex }}
                    >
                      {card.name}
                    </span>

                    {/* Cost */}
                    <span className="text-[10px] font-mono text-cyber-light/40">
                      {card.eddie_cost}E
                    </span>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveCard(card.id)}
                      className="text-cyber-light/20 hover:text-cyber-magenta text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Total */}
      <div className="pt-2 border-t border-cyber-grey flex items-center justify-between">
        <span className="text-xs font-mono text-cyber-light/50">
          Total Cards
        </span>
        <span className="text-sm font-mono font-bold text-cyber-light">
          {totalCards}
        </span>
      </div>
    </div>
  );
}
