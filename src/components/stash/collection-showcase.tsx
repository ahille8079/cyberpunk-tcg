"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { getCardById } from "@/data/cards";
import { useAllCards } from "@/lib/cards/cards-provider";
import { colors } from "@/lib/design-tokens";
import { COLOR_HEX, cn } from "@/lib/utils";
import type { Card, CardType, CardRarity } from "@/lib/cards/types";

interface CollectionShowcaseProps {
  allCards: Card[];
  stash: Map<string, number>;
  flashCardId: string | null;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onRemove: (cardId: string) => void;
  onSetQuantity: (cardId: string, qty: number) => void;
}

const typeLabels: { value: CardType; label: string }[] = [
  { value: "legend", label: "Legends" },
  { value: "unit", label: "Units" },
  { value: "gear", label: "Gear" },
  { value: "program", label: "Programs" },
];

const rarityLabels: { value: CardRarity; label: string }[] = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "secret", label: "Secret" },
  { value: "iconic", label: "Iconic" },
  { value: "nova", label: "Nova" },
];

const factionLabels = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
];

const typeIcons: Record<string, string> = {
  legend: "\u2605",
  unit: "\u2694",
  gear: "\u2699",
  program: "\u25C8",
};

export function CollectionShowcase({
  allCards,
  stash,
  flashCardId,
  expanded,
  onExpandedChange,
  onRemove,
  onSetQuantity,
}: CollectionShowcaseProps) {
  const allCardsRaw = useAllCards();
  const [showDetails, setShowDetails] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const handleImgError = useCallback((cardId: string) => {
    setImgErrors((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  // --- Stats computation ---
  const ownedIds = new Set(stash.keys());
  const ownedCards = useMemo(
    () => allCards.filter((c) => ownedIds.has(c.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allCards, stash]
  );
  const uniqueOwned = ownedCards.length;
  const totalUnique = allCards.length;
  const completionPct =
    totalUnique > 0 ? Math.round((uniqueOwned / totalUnique) * 100) : 0;
  const totalCopies = Array.from(stash.values()).reduce((s, q) => s + q, 0);

  // --- Counter animation ---
  const [isBumping, setIsBumping] = useState(false);
  const prevOwned = useRef(uniqueOwned);

  useEffect(() => {
    if (prevOwned.current !== uniqueOwned) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 300);
      prevOwned.current = uniqueOwned;
      return () => clearTimeout(timer);
    }
  }, [uniqueOwned]);

  // --- Bar pulse animation ---
  const [barPulsing, setBarPulsing] = useState(false);
  const prevPct = useRef(completionPct);
  const [shimmerKey, setShimmerKey] = useState(0);

  useEffect(() => {
    if (prevPct.current !== completionPct) {
      setBarPulsing(true);
      setShimmerKey((k) => k + 1);
      const timer = setTimeout(() => setBarPulsing(false), 600);
      prevPct.current = completionPct;
      return () => clearTimeout(timer);
    }
  }, [completionPct]);

  // --- Card strip entries ---
  const stashEntries = useMemo(() => {
    const entries: { card: Card; quantity: number }[] = [];
    for (const [cardId, qty] of stash) {
      const card = getCardById(cardId, allCardsRaw);
      if (card) entries.push({ card, quantity: qty });
    }
    entries.sort((a, b) => a.card.name.localeCompare(b.card.name));
    return entries;
  }, [stash, allCardsRaw]);

  // --- Deep stats (computed for expanded view) ---
  const deepStats = useMemo(() => {
    if (!expanded) return null;

    const eddieCurve: Record<number, number> = {};
    for (const { card, quantity } of stashEntries) {
      const cost = card.eddie_cost;
      eddieCurve[cost] = (eddieCurve[cost] ?? 0) + quantity;
    }

    const sellTagCards = stashEntries.filter((e) => e.card.has_sell_tag);
    const sellTagCopies = sellTagCards.reduce((s, e) => s + e.quantity, 0);
    const sellPct = totalCopies > 0 ? Math.round((sellTagCopies / totalCopies) * 100) : 0;

    const blockerEntries = stashEntries.filter((e) =>
      e.card.keywords.some((k) => k.toLowerCase() === "blocker")
    );
    const blockerCopies = blockerEntries.reduce((s, e) => s + e.quantity, 0);

    const goSoloEntries = stashEntries.filter((e) =>
      e.card.keywords.some((k) => k.toLowerCase() === "go solo")
    );

    const combatCards = stashEntries.filter(
      (e) => e.card.card_type === "unit" || e.card.card_type === "legend"
    );
    const powerBreakpoints = { below5: 0, from5to9: 0, from10plus: 0 };
    for (const { card, quantity } of combatCards) {
      if (card.power == null) continue;
      if (card.power >= 10) powerBreakpoints.from10plus += quantity;
      else if (card.power >= 5) powerBreakpoints.from5to9 += quantity;
      else powerBreakpoints.below5 += quantity;
    }

    const totalEddieCost = stashEntries.reduce(
      (s, e) => s + e.card.eddie_cost * e.quantity, 0
    );
    const avgEddieCost = totalCopies > 0 ? (totalEddieCost / totalCopies).toFixed(1) : "0";

    const ramByColor: Record<string, { provided: number; cost: number }> = {};
    for (const { card, quantity } of stashEntries) {
      if (!ramByColor[card.color]) ramByColor[card.color] = { provided: 0, cost: 0 };
      if (card.ram_provided != null) ramByColor[card.color].provided += card.ram_provided * quantity;
      if (card.ram_cost != null) ramByColor[card.color].cost += card.ram_cost * quantity;
    }

    const totalValue = stashEntries.reduce(
      (s, e) => s + e.card.eddie_cost * e.quantity, 0
    );

    return {
      eddieCurve,
      sellPct,
      sellTagCopies,
      blockerCopies,
      goSoloCount: goSoloEntries.length,
      powerBreakpoints,
      avgEddieCost,
      ramByColor,
      totalValue,
    };
  }, [expanded, stashEntries, totalCopies]);

  // --- Breakdowns ---
  const byType = (type: CardType) => {
    const total = allCards.filter((c) => c.card_type === type).length;
    const owned = allCards.filter(
      (c) => c.card_type === type && ownedIds.has(c.id)
    ).length;
    return { owned, total };
  };

  const byRarity = (rarity: CardRarity) => {
    const total = allCards.filter((c) => c.rarity === rarity).length;
    const owned = allCards.filter(
      (c) => c.rarity === rarity && ownedIds.has(c.id)
    ).length;
    return { owned, total };
  };

  const byFaction = (color: string) => {
    const total = allCards.filter((c) => c.color === color).length;
    const owned = allCards.filter(
      (c) => c.color === color && ownedIds.has(c.id)
    ).length;
    return { owned, total };
  };

  // --- Scroll ref for auto-scrolling to flashed card ---
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flashCardId && stripRef.current) {
      const el = stripRef.current.querySelector(
        `[data-card-id="${flashCardId}"]`
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [flashCardId]);

  // --- Image renderer with error fallback ---
  const hasImage = (card: Card) => card.image_url && !imgErrors.has(card.id);

  const renderCardImage = (card: Card, size: "strip" | "grid") => {
    const colorHex = COLOR_HEX[card.color] ?? "#d1d5db";
    const icon = typeIcons[card.card_type] ?? "?";

    if (hasImage(card)) {
      return (
        <img
          src={card.image_url!}
          alt={card.name}
          className="w-full h-full object-cover"
          onError={() => handleImgError(card.id)}
        />
      );
    }

    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-1"
        style={{
          background: `linear-gradient(160deg, ${colorHex}30 0%, ${colorHex}08 50%, ${colorHex}20 100%)`,
        }}
      >
        <span
          className={cn("opacity-50", size === "strip" ? "text-lg" : "text-3xl")}
          style={{ color: colorHex }}
        >
          {icon}
        </span>
        <span
          className={cn(
            "font-mono font-bold uppercase leading-tight text-center px-1",
            size === "strip" ? "text-[8px]" : "text-xs"
          )}
          style={{ color: `${colorHex}80` }}
        >
          {size === "strip" ? card.name.slice(0, 5) : card.name}
        </span>
      </div>
    );
  };

  // --- Eddie cost curve max for bar scaling ---
  const maxCurveCount = deepStats
    ? Math.max(...Object.values(deepStats.eddieCurve), 1)
    : 1;

  return (
    <div className="bg-cyber-dark/50 border border-cyber-grey rounded-lg overflow-hidden">
      {/* Row 1: Stats + Progress bar */}
      <div className="p-4 pb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-mono uppercase tracking-wider text-cyber-light/50">
            Stash
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-xl font-mono font-bold text-cyber-yellow inline-block",
                isBumping && "animate-counter-tick"
              )}
            >
              {uniqueOwned}/{totalUnique}
            </span>
            <span className="text-sm font-mono text-cyber-light/40">
              ({completionPct}%)
            </span>
            <span className="text-sm font-mono text-cyber-light/30 hidden sm:inline">
              {totalCopies} copies
            </span>
          </div>
        </div>

        {/* Progress bar with shimmer + edge pulse */}
        <div className="w-full h-3 bg-cyber-grey rounded-full overflow-hidden relative">
          <div
            className={cn(
              "h-full bg-cyber-yellow rounded-full transition-all duration-500 relative overflow-hidden",
              barPulsing && "animate-bar-pulse"
            )}
            style={{ width: `${completionPct}%` }}
          >
            <div
              key={shimmerKey}
              className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ animationFillMode: "forwards" }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Card showcase strip (minimized) or full card grid (expanded) */}
      <div className="px-4 pb-3">
        {stashEntries.length === 0 ? (
          <div className="flex items-center gap-3 py-3">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-14 h-[72px] rounded border-2 border-dashed border-cyber-grey/30 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms`, opacity: 0.3 - i * 0.03 }}
                />
              ))}
            </div>
            <span className="text-sm font-mono text-cyber-light/30 ml-2">
              Click any card below to start collecting
            </span>
          </div>
        ) : expanded ? (
          /* Expanded: full card art grid with hover controls */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 py-2">
            {stashEntries.map(({ card, quantity }) => {
              const colorHex = COLOR_HEX[card.color] ?? "#d1d5db";
              const isFlashing = card.id === flashCardId;

              return (
                <div
                  key={card.id}
                  data-card-id={card.id}
                  className={cn(
                    "relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-300 group/card",
                    isFlashing && "animate-stash-pop"
                  )}
                  style={{
                    borderColor: isFlashing ? "#00f0ff" : colorHex,
                    boxShadow: isFlashing
                      ? `0 0 16px 4px ${colorHex}99, 0 0 32px 8px #00f0ff44`
                      : `0 0 8px 2px ${colorHex}22`,
                  }}
                >
                  {renderCardImage(card, "grid")}

                  {/* Card name + info overlay (always visible) */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyber-black/95 via-cyber-black/70 to-transparent px-2 pt-6 pb-1.5">
                    <p className="text-xs font-mono text-cyber-light leading-tight truncate font-medium">
                      {card.name}
                    </p>
                  </div>

                  {/* Quantity badge */}
                  {quantity > 1 && (
                    <div className="absolute top-1.5 right-1.5 bg-cyber-black/90 border border-cyber-yellow/50 text-xs font-mono text-cyber-yellow px-1.5 py-0.5 rounded font-bold">
                      x{quantity}
                    </div>
                  )}

                  {/* Hover controls for removal/quantity */}
                  <div className="absolute inset-0 bg-cyber-black/80 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                    <p className="text-xs font-mono text-cyber-light/70 truncate max-w-[90%] text-center">
                      {card.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSetQuantity(card.id, Math.max(0, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-base font-mono bg-cyber-grey rounded-lg hover:bg-cyber-magenta/20 hover:text-cyber-magenta transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xl font-mono font-bold text-cyber-yellow min-w-[2ch] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onSetQuantity(card.id, quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-base font-mono bg-cyber-grey rounded-lg hover:bg-cyber-cyan/20 hover:text-cyber-cyan transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(card.id)}
                      className="text-xs font-mono text-cyber-light/40 hover:text-cyber-magenta transition-colors mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Minimized: horizontal strip */
          <div
            ref={stripRef}
            className="flex items-center overflow-x-auto hide-scrollbar py-1 -mx-1"
          >
            {stashEntries.map(({ card, quantity }, i) => {
              const colorHex = COLOR_HEX[card.color] ?? "#d1d5db";
              const isFlashing = card.id === flashCardId;

              return (
                <div
                  key={card.id}
                  data-card-id={card.id}
                  className={cn(
                    "relative shrink-0 w-14 h-[72px] rounded overflow-hidden border-2 transition-all duration-300",
                    i > 0 && "-ml-2 sm:-ml-1.5",
                    isFlashing && "animate-stash-pop z-10"
                  )}
                  style={{
                    borderColor: isFlashing ? "#00f0ff" : colorHex,
                    boxShadow: isFlashing
                      ? `0 0 16px 4px ${colorHex}99, 0 0 32px 8px #00f0ff44`
                      : `0 0 6px 1px ${colorHex}33`,
                    zIndex: isFlashing ? 10 : stashEntries.length - i,
                  }}
                  title={`${card.name}${quantity > 1 ? ` x${quantity}` : ""}`}
                >
                  {renderCardImage(card, "strip")}
                  {quantity > 1 && (
                    <div className="absolute bottom-0 right-0 bg-cyber-black/80 text-[9px] font-mono text-cyber-yellow px-0.5 rounded-tl">
                      {quantity}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expand / Collapse toggle */}
      {stashEntries.length > 0 && (
        <div className="px-4 pb-3">
          <button
            onClick={() => onExpandedChange(!expanded)}
            className={cn(
              "font-mono uppercase tracking-wider transition-colors flex items-center gap-2",
              expanded
                ? "w-full justify-center py-2.5 text-sm bg-cyber-grey/50 border border-cyber-cyan/30 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/10"
                : "text-xs text-cyber-cyan/60 hover:text-cyber-cyan"
            )}
          >
            {expanded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Back to Card Selector
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Expand Stash
              </>
            )}
          </button>
        </div>
      )}

      {/* Deep stats (expanded mode only) */}
      {expanded && deepStats && (
        <div className="border-t border-cyber-grey/50 px-4 py-4 space-y-5">
          {/* Top-level metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Value" value={`${deepStats.totalValue}E`} color="#fcee09" />
            <StatCard label="Avg Cost" value={`${deepStats.avgEddieCost}E`} color="#00f0ff" />
            <StatCard
              label="Sell Tags"
              value={`${deepStats.sellPct}%`}
              sublabel={`${deepStats.sellTagCopies} cards`}
              color={deepStats.sellPct >= 30 ? "#22c55e" : "#ff2a6d"}
              hint={deepStats.sellPct >= 30 ? "Good ratio" : "Below 30% recommended"}
            />
            <StatCard
              label="Blockers"
              value={`${deepStats.blockerCopies}`}
              color={deepStats.blockerCopies >= 4 ? "#22c55e" : "#ff2a6d"}
              hint={deepStats.blockerCopies >= 4 ? "Sufficient" : "Recommend 4+"}
            />
          </div>

          {/* Eddie cost curve */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-light/40">
              Eddie Cost Curve
            </h4>
            <div className="flex items-end gap-1.5 h-20">
              {Array.from({ length: Math.max(...Object.keys(deepStats.eddieCurve).map(Number), 6) + 1 }).map((_, cost) => {
                const count = deepStats.eddieCurve[cost] ?? 0;
                const heightPct = maxCurveCount > 0 ? (count / maxCurveCount) * 100 : 0;
                return (
                  <div key={cost} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full relative" style={{ height: "56px" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-cyber-yellow/70 transition-all duration-300"
                        style={{ height: `${heightPct}%`, minHeight: count > 0 ? "3px" : 0 }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-cyber-light/30">{cost}</span>
                    {count > 0 && (
                      <span className="text-[10px] font-mono text-cyber-yellow/60">{count}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Power distribution + RAM + Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Power distribution */}
            <div className="bg-cyber-black/40 border border-cyber-grey/40 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-light/40">
                Power Distribution
              </h4>
              <div className="space-y-2.5">
                <PowerBar label="10+ PWR" count={deepStats.powerBreakpoints.from10plus} total={totalCopies} color="#ef4444" hint="Extra gig steal" />
                <PowerBar label="5-9 PWR" count={deepStats.powerBreakpoints.from5to9} total={totalCopies} color="#f59e0b" />
                <PowerBar label="1-4 PWR" count={deepStats.powerBreakpoints.below5} total={totalCopies} color="#3b82f6" />
              </div>
            </div>

            {/* RAM budget by color */}
            <div className="bg-cyber-black/40 border border-cyber-grey/40 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-light/40">
                RAM by Faction
              </h4>
              <div className="space-y-2">
                {factionLabels.map(({ value, label }) => {
                  const ram = deepStats.ramByColor[value];
                  if (!ram || (ram.provided === 0 && ram.cost === 0)) return null;
                  const factionColor = COLOR_HEX[value] ?? "#d1d5db";
                  return (
                    <div key={value} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: factionColor }}
                        />
                        <span className="text-sm font-mono text-cyber-light/60">{label}</span>
                      </div>
                      <div className="text-sm font-mono">
                        <span className="text-cyber-cyan">{ram.provided}R</span>
                        <span className="text-cyber-light/30 mx-1">/</span>
                        <span className="text-cyber-light/50">{ram.cost} used</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-cyber-black/40 border border-cyber-grey/40 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-light/40">
                Key Abilities
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-cyber-light/60">Blockers</span>
                  <span className={cn(
                    "text-sm font-mono font-bold",
                    deepStats.blockerCopies >= 4 ? "text-cyber-cyan" : "text-cyber-magenta"
                  )}>
                    {deepStats.blockerCopies}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-cyber-light/60">Go Solo</span>
                  <span className="text-sm font-mono font-bold text-cyber-cyan">{deepStats.goSoloCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-cyber-light/60">Sell Tags</span>
                  <span className="text-sm font-mono font-bold text-cyber-yellow">{deepStats.sellTagCopies}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Breakdown stats (collapsible, expanded by default) — shown in minimized mode */}
      {!expanded && (
        <div className="border-t border-cyber-grey/50">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
          >
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-light/40">
              Breakdown
            </span>
            <svg
              className={cn(
                "w-4 h-4 text-cyber-light/30 transition-transform duration-200",
                showDetails && "rotate-180"
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
          </button>

          {showDetails && (
            <div className="px-4 pb-4 flex flex-wrap gap-x-5 gap-y-3">
              {/* By Type */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-cyber-light/40">
                  Type
                </span>
                <div className="flex flex-wrap gap-2">
                  {typeLabels.map(({ value, label }) => {
                    const { owned, total } = byType(value);
                    if (total === 0) return null;
                    return (
                      <span
                        key={value}
                        className={cn(
                          "text-xs font-mono px-2.5 py-1 rounded-full border",
                          owned === total
                            ? "border-cyber-yellow/50 text-cyber-yellow bg-cyber-yellow/10"
                            : "border-cyber-grey text-cyber-light/50"
                        )}
                      >
                        {label} {owned}/{total}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* By Rarity */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-cyber-light/40">
                  Rarity
                </span>
                <div className="flex flex-wrap gap-2">
                  {rarityLabels.map(({ value, label }) => {
                    const { owned, total } = byRarity(value);
                    if (total === 0) return null;
                    const rarityColor = colors.rarity[value];
                    return (
                      <span
                        key={value}
                        className={cn(
                          "text-xs font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5",
                          owned === total
                            ? "bg-opacity-10"
                            : "border-cyber-grey text-cyber-light/50"
                        )}
                        style={
                          owned === total
                            ? {
                                borderColor: `${rarityColor}80`,
                                color: rarityColor,
                                backgroundColor: `${rarityColor}15`,
                              }
                            : undefined
                        }
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: rarityColor }}
                        />
                        {label} {owned}/{total}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* By Faction */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-cyber-light/40">
                  Faction
                </span>
                <div className="flex flex-wrap gap-2">
                  {factionLabels.map(({ value, label }) => {
                    const { owned, total } = byFaction(value);
                    if (total === 0) return null;
                    const factionColor = COLOR_HEX[value] ?? "#d1d5db";
                    return (
                      <span
                        key={value}
                        className={cn(
                          "text-xs font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5",
                          owned === total
                            ? "bg-opacity-10"
                            : "border-cyber-grey text-cyber-light/50"
                        )}
                        style={
                          owned === total
                            ? {
                                borderColor: `${factionColor}80`,
                                color: factionColor,
                                backgroundColor: `${factionColor}15`,
                              }
                            : undefined
                        }
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: factionColor }}
                        />
                        {label} {owned}/{total}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function StatCard({
  label,
  value,
  sublabel,
  color,
  hint,
}: {
  label: string;
  value: string;
  sublabel?: string;
  color: string;
  hint?: string;
}) {
  return (
    <div className="bg-cyber-black/40 border border-cyber-grey/40 rounded-lg p-4 text-center">
      <div className="text-xs font-mono uppercase tracking-wider text-cyber-light/40 mb-1.5">
        {label}
      </div>
      <div className="text-2xl font-mono font-bold" style={{ color }}>
        {value}
      </div>
      {sublabel && (
        <div className="text-xs font-mono text-cyber-light/30 mt-1">{sublabel}</div>
      )}
      {hint && (
        <div className="text-[10px] font-mono text-cyber-light/25 mt-0.5">{hint}</div>
      )}
    </div>
  );
}

function PowerBar({
  label,
  count,
  total,
  color,
  hint,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  hint?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-cyber-light/60">{label}</span>
          {hint && <span className="text-[10px] font-mono text-cyber-light/25">{hint}</span>}
        </div>
        <span className="text-xs font-mono text-cyber-light/40">{count}</span>
      </div>
      <div className="w-full h-2 bg-cyber-grey/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
