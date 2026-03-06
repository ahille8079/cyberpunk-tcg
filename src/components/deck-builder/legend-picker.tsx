"use client";

import { getLegends } from "@/data/cards";
import { useAllCards } from "@/lib/cards/cards-provider";
import type { Card } from "@/lib/cards/types";
import { cn, COLOR_HEX, MAX_LEGENDS } from "@/lib/utils";

interface LegendPickerProps {
  selectedLegends: Card[];
  onToggleLegend: (card: Card) => void;
}

export function LegendPicker({
  selectedLegends,
  onToggleLegend,
}: LegendPickerProps) {
  const allCards = useAllCards();
  const legends = getLegends(allCards);
  const selectedIds = new Set(selectedLegends.map((l) => l.id));
  const isFull = selectedLegends.length >= MAX_LEGENDS;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-mono uppercase text-cyber-light/50 mb-3">
        Select {MAX_LEGENDS} Legends ({selectedLegends.length}/{MAX_LEGENDS})
      </h3>

      {legends.map((legend) => {
        const isSelected = selectedIds.has(legend.id);
        const isDisabled = !isSelected && isFull;
        const colorHex = COLOR_HEX[legend.color] ?? "#d1d5db";

        return (
          <button
            key={legend.id}
            onClick={() => !isDisabled && onToggleLegend(legend)}
            disabled={isDisabled}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all",
              isSelected
                ? "border-current bg-current/5"
                : isDisabled
                  ? "border-cyber-grey/50 opacity-40 cursor-not-allowed"
                  : "border-cyber-grey hover:border-current/50 cursor-pointer"
            )}
            style={
              isSelected || !isDisabled
                ? ({ "--tw-border-opacity": 1, borderColor: colorHex } as React.CSSProperties)
                : undefined
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
                <span
                  className={cn(
                    "font-bold text-sm",
                    isSelected ? "text-cyber-light" : "text-cyber-light/70"
                  )}
                >
                  {legend.name}
                </span>
              </div>
              <span className="text-xs font-mono text-cyber-cyan">
                +{legend.ram_provided} RAM
              </span>
            </div>
            {legend.ability_text && (
              <p className="text-[11px] text-cyber-light/40 mt-1 ml-5 line-clamp-1">
                {legend.ability_text}
              </p>
            )}
          </button>
        );
      })}

      {/* RAM summary */}
      {selectedLegends.length > 0 && (
        <div className="mt-4 p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg">
          <h4 className="text-[10px] font-mono uppercase text-cyber-light/40 mb-2">
            Total RAM Budget
          </h4>
          <div className="space-y-1">
            {Object.entries(
              selectedLegends.reduce(
                (acc, l) => {
                  acc[l.color] = (acc[l.color] ?? 0) + (l.ram_provided ?? 0);
                  return acc;
                },
                {} as Record<string, number>
              )
            ).map(([color, ram]) => (
              <div
                key={color}
                className="flex items-center justify-between text-xs font-mono"
              >
                <span style={{ color: COLOR_HEX[color] ?? "#d1d5db" }}>
                  {color}
                </span>
                <span className="text-cyber-cyan">{ram} RAM</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
