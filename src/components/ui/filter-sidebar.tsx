"use client";

import { useCallback, useState, useEffect } from "react";
import type { CardFilters, CardType, CardRarity } from "@/lib/cards/types";
import { cn, COLOR_HEX } from "@/lib/utils";

interface FilterSidebarProps {
  filters: CardFilters;
  onFilterChange: (filters: CardFilters) => void;
  className?: string;
}

const cardTypes: { value: CardType; label: string }[] = [
  { value: "legend", label: "Legend" },
  { value: "unit", label: "Unit" },
  { value: "gear", label: "Gear" },
  { value: "program", label: "Program" },
];

const cardColors = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
];

const rarities: { value: CardRarity; label: string }[] = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "secret", label: "Secret" },
  { value: "iconic", label: "Iconic" },
  { value: "nova", label: "Nova" },
];

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "eddie_cost", label: "Cost" },
  { value: "power", label: "Power" },
  { value: "rarity", label: "Rarity" },
];

export function FilterSidebar({
  filters,
  onFilterChange,
  className,
}: FilterSidebarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, search: searchInput || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFilter = useCallback(
    (key: keyof CardFilters, value: unknown) => {
      onFilterChange({ ...filters, [key]: value || undefined });
    },
    [filters, onFilterChange]
  );

  const hasActiveFilters =
    filters.card_type || filters.color || filters.rarity || filters.search;

  return (
    <div
      className={cn(
        "space-y-2 p-3 bg-cyber-dark/50 border border-cyber-grey rounded-lg",
        className
      )}
    >
      {/* Row 1: Search + Sort */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search cards..."
          className="flex-1 min-w-0 bg-cyber-black border border-cyber-grey rounded px-2.5 py-1.5 text-xs text-cyber-light placeholder:text-cyber-light/30 focus:border-cyber-yellow focus:outline-none"
        />
        <select
          value={filters.sortBy ?? "name"}
          onChange={(e) => setFilter("sortBy", e.target.value)}
          className="bg-cyber-black border border-cyber-grey rounded px-2 py-1.5 text-xs text-cyber-light focus:border-cyber-yellow focus:outline-none"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            setFilter("sortDir", filters.sortDir === "asc" ? "desc" : "asc")
          }
          className="px-2 py-1.5 bg-cyber-black border border-cyber-grey rounded text-xs text-cyber-light hover:border-cyber-yellow"
        >
          {filters.sortDir === "desc" ? "\u2193" : "\u2191"}
        </button>
      </div>

      {/* Row 2: Type pills + Color dots + Rarity + Clear */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Type pills */}
        {cardTypes.map((t) => (
          <button
            key={t.value}
            onClick={() =>
              setFilter(
                "card_type",
                filters.card_type === t.value ? null : t.value
              )
            }
            className={cn(
              "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors",
              filters.card_type === t.value
                ? "border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow"
                : "border-cyber-grey/60 text-cyber-light/50 hover:border-cyber-light/40"
            )}
          >
            {t.label}
          </button>
        ))}

        {/* Separator */}
        <span className="w-px h-4 bg-cyber-grey/50 mx-0.5" />

        {/* Color dots */}
        {cardColors.map((c) => (
          <button
            key={c.value}
            onClick={() =>
              setFilter("color", filters.color === c.value ? null : c.value)
            }
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-all",
              filters.color === c.value
                ? "scale-110 border-white"
                : "border-transparent opacity-50 hover:opacity-100"
            )}
            style={{ backgroundColor: COLOR_HEX[c.value] }}
            title={c.label}
          />
        ))}

        {/* Separator */}
        <span className="w-px h-4 bg-cyber-grey/50 mx-0.5" />

        {/* Rarity dropdown */}
        <select
          value={filters.rarity ?? ""}
          onChange={(e) => setFilter("rarity", e.target.value || null)}
          className="bg-cyber-black border border-cyber-grey/60 rounded px-1.5 py-0.5 text-[10px] font-mono text-cyber-light focus:border-cyber-yellow focus:outline-none"
        >
          <option value="">Rarity</option>
          {rarities.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchInput("");
              onFilterChange({});
            }}
            className="text-[10px] font-mono text-cyber-light/30 hover:text-cyber-magenta transition-colors ml-auto"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
