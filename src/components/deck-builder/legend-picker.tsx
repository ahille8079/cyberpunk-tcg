"use client";

import { useState } from "react";
import { getLegends, getUniqueCards } from "@/data/cards";
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
  const legends = getLegends(getUniqueCards(allCards));
  const selectedIds = new Set(selectedLegends.map((l) => l.id));
  const isFull = selectedLegends.length >= MAX_LEGENDS;
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-1.5" data-testid="legend-picker">
      <h3
        className="text-xs font-mono uppercase text-cyber-light/50 mb-2"
        data-testid="legend-counter"
      >
        Select {MAX_LEGENDS} Legends ({selectedLegends.length}/{MAX_LEGENDS})
      </h3>

      {legends.map((legend) => {
        const isSelected = selectedIds.has(legend.id);
        const isDisabled = !isSelected && isFull;
        const colorHex = COLOR_HEX[legend.color] ?? "#d1d5db";
        const hasImage = legend.image_url && !brokenImages.has(legend.id);

        return (
          <button
            key={legend.id}
            data-testid={`legend-btn-${legend.id}`}
            onClick={() => !isDisabled && onToggleLegend(legend)}
            disabled={isDisabled}
            className={cn(
              "w-full text-left rounded-lg border overflow-hidden transition-all duration-200 flex gap-2.5 p-2",
              isSelected
                ? "bg-current/5"
                : isDisabled
                  ? "border-cyber-grey/30 opacity-30 grayscale pointer-events-none"
                  : "border-cyber-grey hover:border-current/60 cursor-pointer"
            )}
            style={{
              borderColor: isDisabled ? undefined : isSelected ? colorHex : undefined,
              boxShadow: isSelected
                ? `0 0 8px ${colorHex}30, inset 0 0 12px ${colorHex}08`
                : undefined,
            }}
          >
            {/* Avatar thumbnail */}
            <div
              className={cn(
                "w-11 h-11 rounded shrink-0 overflow-hidden border",
                isSelected ? "border-current" : "border-cyber-grey/50"
              )}
              style={isSelected ? { borderColor: colorHex } : undefined}
            >
              {hasImage ? (
                <img
                  src={legend.image_url!}
                  alt={legend.name}
                  loading="lazy"
                  className={cn(
                    "w-full h-full object-cover transition-all duration-200",
                    isSelected ? "brightness-100" : "brightness-[0.5]"
                  )}
                  onError={() =>
                    setBrokenImages((prev) => new Set(prev).add(legend.id))
                  }
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${colorHex}30 0%, ${colorHex}10 100%)`,
                    color: colorHex,
                  }}
                >
                  ★
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-0.5">
              {/* Name + RAM */}
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={cn(
                    "font-bold text-xs leading-tight truncate",
                    isSelected ? "text-cyber-light" : "text-cyber-light/70"
                  )}
                  style={isSelected ? { color: colorHex } : undefined}
                >
                  {legend.name}
                </span>
                <span
                  className="text-[9px] font-mono shrink-0 px-1 py-px rounded"
                  style={{
                    backgroundColor: `${colorHex}20`,
                    color: colorHex,
                  }}
                >
                  +{legend.ram_provided}R
                </span>
              </div>

              {/* Keywords */}
              {legend.keywords.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {legend.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[9px] font-mono px-1 py-px bg-cyber-grey/60 rounded text-cyber-light/50"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Ability text */}
              {legend.ability_text && (
                <p className="text-[10px] text-cyber-light/40 line-clamp-1 leading-snug">
                  {legend.ability_text}
                </p>
              )}
            </div>
          </button>
        );
      })}

      {/* RAM Budget Summary */}
      {selectedLegends.length > 0 && (
        <div className="mt-3 p-2.5 bg-cyber-dark/50 border border-cyber-grey rounded-lg">
          <h4 className="text-[10px] font-mono uppercase text-cyber-light/40 mb-1.5">
            RAM Budget
          </h4>
          {(() => {
            const colorTotals = selectedLegends.reduce(
              (acc, l) => {
                acc[l.color] = (acc[l.color] ?? 0) + (l.ram_provided ?? 0);
                return acc;
              },
              {} as Record<string, number>
            );
            const totalRam = Object.values(colorTotals).reduce(
              (s, v) => s + v,
              0
            );
            const entries = Object.entries(colorTotals);

            return (
              <>
                {/* Stacked bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden mb-1.5">
                  {entries.map(([color, ram]) => (
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
                {/* Labels */}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {entries.map(([color, ram]) => (
                    <div
                      key={color}
                      className="flex items-center gap-1 text-[10px] font-mono"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: COLOR_HEX[color] ?? "#d1d5db",
                        }}
                      />
                      <span style={{ color: COLOR_HEX[color] ?? "#d1d5db" }}>
                        {color}
                      </span>
                      <span className="text-cyber-light/50">{ram}R</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
