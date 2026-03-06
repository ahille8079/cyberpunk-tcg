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
  { value: "eddie_cost", label: "Eddie Cost" },
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

  return (
    <div className={cn("space-y-5 p-4 bg-cyber-dark/50 border border-cyber-grey rounded-lg", className)}>
      {/* Search */}
      <div>
        <label className="block text-xs font-mono uppercase text-cyber-light/60 mb-1.5">
          Search
        </label>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Card name or keyword..."
          className="w-full bg-cyber-black border border-cyber-grey rounded px-3 py-2 text-sm text-cyber-light placeholder:text-cyber-light/30 focus:border-cyber-yellow focus:outline-none"
        />
      </div>

      {/* Card Type */}
      <div>
        <label className="block text-xs font-mono uppercase text-cyber-light/60 mb-1.5">
          Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {cardTypes.map((t) => (
            <button
              key={t.value}
              onClick={() =>
                setFilter("card_type", filters.card_type === t.value ? null : t.value)
              }
              className={cn(
                "px-2.5 py-1 text-xs font-mono rounded border transition-colors",
                filters.card_type === t.value
                  ? "border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow"
                  : "border-cyber-grey text-cyber-light/60 hover:border-cyber-light/40"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-mono uppercase text-cyber-light/60 mb-1.5">
          Color
        </label>
        <div className="flex gap-2">
          {cardColors.map((c) => (
            <button
              key={c.value}
              onClick={() =>
                setFilter("color", filters.color === c.value ? null : c.value)
              }
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                filters.color === c.value
                  ? "scale-110 border-white"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
              style={{ backgroundColor: COLOR_HEX[c.value] }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div>
        <label className="block text-xs font-mono uppercase text-cyber-light/60 mb-1.5">
          Rarity
        </label>
        <select
          value={filters.rarity ?? ""}
          onChange={(e) => setFilter("rarity", e.target.value || null)}
          className="w-full bg-cyber-black border border-cyber-grey rounded px-3 py-2 text-sm text-cyber-light focus:border-cyber-yellow focus:outline-none"
        >
          <option value="">All Rarities</option>
          {rarities.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-mono uppercase text-cyber-light/60 mb-1.5">
          Sort By
        </label>
        <div className="flex gap-2">
          <select
            value={filters.sortBy ?? "name"}
            onChange={(e) => setFilter("sortBy", e.target.value)}
            className="flex-1 bg-cyber-black border border-cyber-grey rounded px-3 py-2 text-sm text-cyber-light focus:border-cyber-yellow focus:outline-none"
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
            className="px-3 py-2 bg-cyber-black border border-cyber-grey rounded text-sm text-cyber-light hover:border-cyber-yellow"
          >
            {filters.sortDir === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={() => {
          setSearchInput("");
          onFilterChange({});
        }}
        className="w-full text-xs font-mono uppercase text-cyber-light/40 hover:text-cyber-magenta transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
