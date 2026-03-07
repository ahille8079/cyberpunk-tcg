"use client";

import { useState, useMemo } from "react";
import { getCardById } from "@/data/cards";
import { useAllCards } from "@/lib/cards/cards-provider";
import { COLOR_HEX, cn } from "@/lib/utils";
import type { Card } from "@/lib/cards/types";

interface StashDockProps {
  stash: Map<string, number>;
  onSetQuantity: (cardId: string, qty: number) => void;
  onRemove: (cardId: string) => void;
  flashCardId: string | null;
}

export function StashDock({
  stash,
  onSetQuantity,
  onRemove,
  flashCardId,
}: StashDockProps) {
  const allCards = useAllCards();
  const [expanded, setExpanded] = useState(false);

  const stashEntries = useMemo(() => {
    const entries: { card: Card; quantity: number }[] = [];
    for (const [cardId, qty] of stash) {
      const card = getCardById(cardId, allCards);
      if (card) entries.push({ card, quantity: qty });
    }
    entries.sort((a, b) => a.card.name.localeCompare(b.card.name));
    return entries;
  }, [stash, allCards]);

  const totalCopies = useMemo(
    () => Array.from(stash.values()).reduce((s, q) => s + q, 0),
    [stash]
  );

  if (stash.size === 0) {
    return (
      <div className="bg-cyber-dark/50 border border-cyber-grey rounded-lg px-4 py-3">
        <p className="text-sm font-mono text-cyber-light/30">
          Your stash is empty. Click any card below to start collecting.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cyber-dark/50 border border-cyber-grey rounded-lg overflow-hidden">
      {/* Header bar — always visible, click to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
      >
        {/* Thumbnails */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          {stashEntries.slice(0, 14).map(({ card, quantity }) => {
            const colorHex = COLOR_HEX[card.color] ?? "#d1d5db";
            const isFlashing = card.id === flashCardId;

            return (
              <div
                key={card.id}
                className={cn(
                  "relative shrink-0 w-8 h-10 rounded border overflow-hidden transition-all duration-300",
                  isFlashing
                    ? "scale-110 border-cyber-cyan shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                    : "border-cyber-grey/60"
                )}
                style={{
                  background: `linear-gradient(135deg, ${colorHex}40, ${colorHex}10)`,
                }}
                title={`${card.name} x${quantity}`}
              >
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-[8px] font-mono font-bold"
                    style={{ color: colorHex }}
                  >
                    {card.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {quantity > 1 && (
                  <div className="absolute bottom-0 right-0 bg-cyber-black/80 text-[8px] font-mono text-cyber-yellow px-0.5 rounded-tl">
                    {quantity}
                  </div>
                )}
              </div>
            );
          })}
          {stashEntries.length > 14 && (
            <span className="text-[10px] font-mono text-cyber-light/30 shrink-0 ml-1">
              +{stashEntries.length - 14}
            </span>
          )}
        </div>

        {/* Label + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono uppercase tracking-wider text-cyber-yellow">
            Stash
          </span>
          <span className="text-[10px] font-mono text-cyber-light/40 hidden sm:inline">
            {stash.size} &middot; {totalCopies} copies
          </span>
          <svg
            className={cn(
              "w-4 h-4 text-cyber-light/40 transition-transform",
              expanded && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expanded list with card art + always-visible controls */}
      {expanded && (
        <div className="border-t border-cyber-grey max-h-[50vh] overflow-y-auto">
          <div className="p-3 space-y-2">
            {stashEntries.map(({ card, quantity }) => {
              const colorHex = COLOR_HEX[card.color] ?? "#d1d5db";

              return (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-cyber-black/40 border border-cyber-grey/40"
                >
                  {/* Card art thumbnail */}
                  <div
                    className="shrink-0 w-14 h-18 sm:w-16 sm:h-20 rounded overflow-hidden border-2"
                    style={{
                      borderColor: colorHex,
                      background: `linear-gradient(135deg, ${colorHex}20, ${colorHex}05)`,
                    }}
                  >
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-lg opacity-30"
                      >
                        {card.card_type === "legend"
                          ? "★"
                          : card.card_type === "unit"
                            ? "⚔"
                            : card.card_type === "gear"
                              ? "⚙"
                              : "◈"}
                      </div>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-bold text-cyber-light truncate">
                      {card.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${colorHex}20`,
                          color: colorHex,
                        }}
                      >
                        {card.card_type}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase ${
                          card.printing === "foil"
                            ? "text-cyber-yellow/70"
                            : "text-cyber-light/30"
                        }`}
                      >
                        {card.printing}
                      </span>
                      {card.eddie_cost > 0 && (
                        <span className="text-[10px] font-mono text-cyber-yellow/60">
                          {card.eddie_cost}E
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity controls — always visible */}
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      onClick={() =>
                        onSetQuantity(card.id, Math.max(0, quantity - 1))
                      }
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-mono bg-cyber-grey rounded hover:bg-cyber-magenta/20 hover:text-cyber-magenta transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg sm:text-base font-mono font-bold text-cyber-yellow min-w-[2ch] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onSetQuantity(card.id, quantity + 1)}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-mono bg-cyber-grey rounded hover:bg-cyber-cyan/20 hover:text-cyber-cyan transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onRemove(card.id)}
                    className="shrink-0 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded bg-cyber-grey hover:bg-cyber-magenta/20 transition-colors group/del"
                    title="Remove from stash"
                  >
                    <svg
                      className="w-4 h-4 text-cyber-light/30 group-hover/del:text-cyber-magenta transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
