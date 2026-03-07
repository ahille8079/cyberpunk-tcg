"use client";

import { useState } from "react";
import type { Card, DeckCard } from "@/lib/cards/types";
import { cn, COLOR_HEX, MAX_COPIES } from "@/lib/utils";

interface DeckCardListProps {
  legends: Card[];
  deckCards: DeckCard[];
  allCards: Card[];
  onRemoveCard: (cardId: string) => void;
  onChangeQuantity: (cardId: string, quantity: number) => void;
  onRemoveLegend: (cardId: string) => void;
  onRequestLegendPick?: () => void;
}

export function DeckCardList({
  legends,
  deckCards,
  allCards,
  onRemoveCard,
  onChangeQuantity,
  onRemoveLegend,
  onRequestLegendPick,
}: DeckCardListProps) {
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

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

  // RAM budget from selected legends
  const colorTotals = legends.reduce(
    (acc, l) => {
      acc[l.color] = (acc[l.color] ?? 0) + (l.ram_provided ?? 0);
      return acc;
    },
    {} as Record<string, number>
  );
  const totalRam = Object.values(colorTotals).reduce((s, v) => s + v, 0);
  const ramEntries = Object.entries(colorTotals);

  return (
    <div className="space-y-3" data-testid="deck-card-list">
      {/* Legend Lineup */}
      <div>
        <h3 className="text-sm font-mono uppercase text-cyber-light/50 mb-2">
          Legends
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => {
            const legend = legends[i];
            if (!legend) {
              return (
                <button
                  key={i}
                  onClick={onRequestLegendPick}
                  className="flex flex-col items-center justify-center border border-dashed border-cyber-grey/40 rounded-lg aspect-[3/4] text-cyber-light/20 hover:border-cyber-grey/60 hover:text-cyber-light/30 transition-colors cursor-pointer"
                >
                  <span className="text-xl">+</span>
                  <span className="text-[10px] font-mono mt-0.5">Legend</span>
                </button>
              );
            }
            const colorHex = COLOR_HEX[legend.color] ?? "#d1d5db";
            const hasImage =
              legend.image_url && !brokenImages.has(legend.id);

            return (
              <div
                key={legend.id}
                className="group relative rounded-lg overflow-hidden border"
                style={{
                  borderColor: `${colorHex}80`,
                  boxShadow: `0 0 6px ${colorHex}25`,
                }}
              >
                {/* Art thumbnail */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  {hasImage ? (
                    <img
                      src={legend.image_url!}
                      alt={legend.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={() =>
                        setBrokenImages((prev) =>
                          new Set(prev).add(legend.id)
                        )
                      }
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${colorHex}40 0%, ${colorHex}15 100%)`,
                      }}
                    />
                  )}
                  {/* Gradient fade at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cyber-dark to-transparent" />

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveLegend(legend.id)}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded bg-cyber-black/60 text-cyber-light/40 hover:text-cyber-magenta text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>

                {/* Info */}
                <div
                  className="p-1.5 bg-cyber-dark"
                  style={{ borderTop: `2px solid ${colorHex}` }}
                >
                  <p
                    className="text-[11px] font-bold text-center truncate leading-tight"
                    style={{ color: colorHex }}
                  >
                    {legend.name.split(" - ")[0]}
                  </p>
                  {legend.keywords.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                      {legend.keywords.slice(0, 2).map((kw) => (
                        <span
                          key={kw}
                          className="text-[9px] font-mono px-1 py-px bg-cyber-grey/60 rounded text-cyber-light/50"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Combined RAM Bar */}
        {legends.length > 0 && (
          <div className="mt-2">
            <div className="flex h-1.5 rounded-full overflow-hidden">
              {ramEntries.map(([color, ram]) => (
                <div
                  key={color}
                  className="transition-all duration-300"
                  style={{
                    backgroundColor: COLOR_HEX[color] ?? "#d1d5db",
                    width: `${(ram / totalRam) * 100}%`,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-1 justify-center">
              {ramEntries.map(([color, ram]) => (
                <span
                  key={color}
                  className="text-xs font-mono"
                  style={{ color: COLOR_HEX[color] ?? "#d1d5db" }}
                >
                  {ram}R
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cards by type */}
      {typeOrder.map((type) => {
        const cards = grouped[type];
        if (!cards?.length) return null;

        return (
          <div key={type}>
            <h3 className="text-sm font-mono uppercase text-cyber-light/50 mb-1.5 flex items-center justify-between">
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
                      className="text-sm text-cyber-light flex-1 truncate"
                      style={{ color: colorHex }}
                    >
                      {card.name}
                    </span>

                    {/* Cost */}
                    <span className="text-xs font-mono text-cyber-light/40">
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
