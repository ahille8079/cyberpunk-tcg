"use client";

import type { Card, CardType, CardRarity } from "@/lib/cards/types";
import { colors } from "@/lib/design-tokens";
import { COLOR_HEX } from "@/lib/utils";

interface StashStatsProps {
  allCards: Card[];
  stash: Map<string, number>;
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

export function StashStats({ allCards, stash }: StashStatsProps) {
  const ownedIds = new Set(stash.keys());
  const uniqueOwned = allCards.filter((c) => ownedIds.has(c.id)).length;
  const totalUnique = allCards.length;
  const completionPct =
    totalUnique > 0 ? Math.round((uniqueOwned / totalUnique) * 100) : 0;
  const totalCopies = Array.from(stash.values()).reduce((s, q) => s + q, 0);

  // Breakdowns
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

  return (
    <div className="space-y-4">
      {/* Overall completion */}
      <div className="bg-cyber-dark/50 border border-cyber-grey rounded-lg p-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-mono uppercase text-cyber-light/60">
            Collection
          </span>
          <span className="text-lg font-mono font-bold text-cyber-yellow">
            {uniqueOwned}/{totalUnique}{" "}
            <span className="text-sm text-cyber-light/40">
              ({completionPct}%)
            </span>
          </span>
        </div>
        <div className="w-full h-2 bg-cyber-grey rounded-full overflow-hidden">
          <div
            className="h-full bg-cyber-yellow rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="text-xs font-mono text-cyber-light/30 mt-2">
          {totalCopies} total copies
        </div>
      </div>

      {/* Breakdowns grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* By type */}
        <div className="bg-cyber-dark/50 border border-cyber-grey rounded-lg p-3">
          <h3 className="text-xs font-mono uppercase text-cyber-light/60 mb-2">
            By Type
          </h3>
          <div className="space-y-1.5">
            {typeLabels.map(({ value, label }) => {
              const { owned, total } = byType(value);
              if (total === 0) return null;
              return (
                <div key={value} className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyber-light/70">
                    {label}
                  </span>
                  <span className="text-xs font-mono text-cyber-light/50">
                    {owned}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By rarity */}
        <div className="bg-cyber-dark/50 border border-cyber-grey rounded-lg p-3">
          <h3 className="text-xs font-mono uppercase text-cyber-light/60 mb-2">
            By Rarity
          </h3>
          <div className="space-y-1.5">
            {rarityLabels.map(({ value, label }) => {
              const { owned, total } = byRarity(value);
              if (total === 0) return null;
              return (
                <div key={value} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: colors.rarity[value],
                      }}
                    />
                    <span className="text-xs font-mono text-cyber-light/70">
                      {label}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyber-light/50">
                    {owned}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By faction */}
        <div className="bg-cyber-dark/50 border border-cyber-grey rounded-lg p-3">
          <h3 className="text-xs font-mono uppercase text-cyber-light/60 mb-2">
            By Faction
          </h3>
          <div className="space-y-1.5">
            {factionLabels.map(({ value, label }) => {
              const { owned, total } = byFaction(value);
              if (total === 0) return null;
              return (
                <div key={value} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: COLOR_HEX[value],
                      }}
                    />
                    <span className="text-xs font-mono text-cyber-light/70">
                      {label}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyber-light/50">
                    {owned}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
