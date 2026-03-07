"use client";

import { useMemo, useState } from "react";
import type { Card, DeckCard } from "@/lib/cards/types";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/design-tokens";

interface EconomyTimelineProps {
  deckCards: DeckCard[];
  allCards: Card[];
  legendCount: number;
}

const MAX_TURNS = 8;

export function EconomyTimeline({
  deckCards,
  allCards,
  legendCount,
}: EconomyTimelineProps) {
  const [legendSacrifices, setLegendSacrifices] = useState<Set<number>>(
    new Set()
  );

  const totalLegendsUsed = legendSacrifices.size;

  function toggleLegendSacrifice(turn: number) {
    setLegendSacrifices((prev) => {
      const next = new Set(prev);
      if (next.has(turn)) {
        next.delete(turn);
      } else {
        if (next.size >= legendCount) return prev;
        next.add(turn);
      }
      return next;
    });
  }

  const resolvedCards = useMemo(() => {
    return deckCards
      .map((dc) => {
        const card = allCards.find((c) => c.id === dc.card_id);
        return card
          ? {
              cost: card.eddie_cost,
              quantity: dc.quantity,
              hasSellTag: card.has_sell_tag,
            }
          : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [deckCards, allCards]);

  const sellTagCount = useMemo(
    () =>
      resolvedCards
        .filter((c) => c.hasSellTag)
        .reduce((s, c) => s + c.quantity, 0),
    [resolvedCards]
  );

  const totalCards = useMemo(
    () => resolvedCards.reduce((s, c) => s + c.quantity, 0),
    [resolvedCards]
  );

  const cardsByCost = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const c of resolvedCards) {
      counts[c.cost] = (counts[c.cost] ?? 0) + c.quantity;
    }
    return counts;
  }, [resolvedCards]);

  const timeline = useMemo(() => {
    const turns: {
      turn: number;
      eddiesFromSelling: number;
      legendEddie: boolean;
      totalEddies: number;
      affordableCards: number;
      affordablePct: number;
    }[] = [];

    let soldCards = 0;

    for (let t = 1; t <= MAX_TURNS; t++) {
      if (soldCards < sellTagCount) {
        soldCards++;
      }

      const legendEddie = legendSacrifices.has(t);
      const totalEddies = soldCards + (legendEddie ? 1 : 0);

      let affordableCards = 0;
      for (const [cost, count] of Object.entries(cardsByCost)) {
        if (Number(cost) <= totalEddies) {
          affordableCards += count;
        }
      }

      const affordablePct = totalCards > 0 ? affordableCards / totalCards : 0;

      turns.push({
        turn: t,
        eddiesFromSelling: soldCards,
        legendEddie,
        totalEddies,
        affordableCards,
        affordablePct,
      });
    }

    return turns;
  }, [sellTagCount, legendSacrifices, cardsByCost, totalCards]);

  const maxEddies = Math.max(...timeline.map((t) => t.totalEddies), 1);

  if (totalCards === 0) return null;

  return (
    <div className="p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg">
      <h3 className="text-sm font-mono uppercase text-cyber-light/50 mb-1">
        Economy Timeline
      </h3>
      <p className="text-[11px] font-mono text-cyber-light/30 mb-3">
        Eddies/turn if selling every turn. Click a turn to sacrifice a Legend
        (+1E).
      </p>

      {/* Timeline bars */}
      <div className="space-y-1">
        {timeline.map((t) => (
          <button
            key={t.turn}
            onClick={() => toggleLegendSacrifice(t.turn)}
            className={cn(
              "w-full flex items-center gap-2 group transition-colors rounded px-1 py-1",
              "hover:bg-cyber-grey/20"
            )}
          >
            {/* Turn label */}
            <span className="text-xs font-mono text-cyber-light/50 w-6 shrink-0 text-right">
              T{t.turn}
            </span>

            {/* Bar */}
            <div className="flex-1 h-5 bg-cyber-grey/30 rounded-sm overflow-hidden relative">
              <div
                className="absolute inset-y-0 left-0 rounded-sm transition-all duration-300"
                style={{
                  width: `${(t.eddiesFromSelling / maxEddies) * 100}%`,
                  backgroundColor: colors.cyan,
                  opacity: 0.7,
                }}
              />
              {t.legendEddie && (
                <div
                  className="absolute inset-y-0 rounded-sm transition-all duration-300"
                  style={{
                    left: `${(t.eddiesFromSelling / maxEddies) * 100}%`,
                    width: `${(1 / maxEddies) * 100}%`,
                    backgroundColor: colors.yellow,
                    opacity: 0.9,
                  }}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-end pr-1.5">
                <span className="text-[10px] font-mono font-bold text-cyber-light/80 drop-shadow-sm">
                  {t.totalEddies}E
                </span>
              </div>
            </div>

            {/* Affordable % */}
            <span
              className={cn(
                "text-xs font-mono w-9 text-right shrink-0 font-bold",
                t.affordablePct >= 0.8
                  ? "text-cyber-cyan"
                  : t.affordablePct >= 0.5
                    ? "text-cyber-yellow"
                    : "text-cyber-light/40"
              )}
            >
              {Math.round(t.affordablePct * 100)}%
            </span>
          </button>
        ))}
      </div>

      {/* Key */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-cyber-light/40">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: colors.cyan, opacity: 0.7 }}
          />
          Sell income
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: colors.yellow, opacity: 0.9 }}
          />
          Legend sac
        </span>
        <span>% = cards you can afford</span>
      </div>

      {totalLegendsUsed > 0 && (
        <div className="mt-2 text-xs font-mono text-cyber-yellow/70">
          {totalLegendsUsed}/{legendCount} legend
          {totalLegendsUsed !== 1 ? "s" : ""} sacrificed
        </div>
      )}
    </div>
  );
}
