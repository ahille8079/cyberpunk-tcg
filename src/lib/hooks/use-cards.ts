"use client";

import { useMemo } from "react";
import { getUniqueCards } from "@/data/cards";
import { useAllCards } from "@/lib/cards/cards-provider";
import type { Card, CardFilters } from "@/lib/cards/types";

const RARITY_ORDER: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  secret: 4,
  iconic: 5,
  nova: 6,
};

export function useCards(filters?: CardFilters): Card[] {
  const allCards = useAllCards();
  return useMemo(() => {
    let result = [...getUniqueCards(allCards)];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.ability_text?.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.toLowerCase().includes(q)) ||
          c.classification.some((cl) => cl.toLowerCase().includes(q))
      );
    }

    if (filters?.card_type) {
      result = result.filter((c) => c.card_type === filters.card_type);
    }

    if (filters?.color) {
      result = result.filter((c) => c.color === filters.color);
    }

    if (filters?.rarity) {
      result = result.filter((c) => c.rarity === filters.rarity);
    }

    if (filters?.minCost != null) {
      result = result.filter((c) => c.eddie_cost >= filters.minCost!);
    }

    if (filters?.maxCost != null) {
      result = result.filter((c) => c.eddie_cost <= filters.maxCost!);
    }

    if (filters?.keywords?.length) {
      result = result.filter((c) =>
        filters.keywords!.some((k) => c.keywords.includes(k))
      );
    }

    // Sort
    const sortBy = filters?.sortBy ?? "name";
    const sortDir = filters?.sortDir ?? "asc";
    const mul = sortDir === "asc" ? 1 : -1;

    result.sort((a, b) => {
      switch (sortBy) {
        case "eddie_cost":
          return (a.eddie_cost - b.eddie_cost) * mul;
        case "power":
          return ((a.power ?? 0) - (b.power ?? 0)) * mul;
        case "rarity":
          return ((RARITY_ORDER[a.rarity] ?? 0) - (RARITY_ORDER[b.rarity] ?? 0)) * mul;
        case "name":
        default:
          return a.name.localeCompare(b.name) * mul;
      }
    });

    return result;
  }, [filters, allCards]);
}
