"use client";

import Link from "next/link";
import type { Card, CardType, CardRarity } from "@/lib/cards/types";
import { colors } from "@/lib/design-tokens";

interface StashSuggestionsProps {
  allCards: Card[];
  stash: Map<string, number>;
}

interface Suggestion {
  text: string;
  href: string;
  color: string;
}

const typeNames: Record<CardType, string> = {
  legend: "Legends",
  unit: "Units",
  gear: "Gear",
  program: "Programs",
};

const rarityNames: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  secret: "Secret",
  iconic: "Iconic",
  nova: "Nova",
};

export function StashSuggestions({ allCards, stash }: StashSuggestionsProps) {
  const ownedIds = new Set(stash.keys());
  const suggestions: Suggestion[] = [];

  // Check if collection is complete
  if (ownedIds.size >= allCards.length) {
    return (
      <div className="bg-cyber-yellow/5 border border-cyber-yellow/20 rounded-lg px-4 py-3">
        <p className="text-sm font-mono text-cyber-yellow">
          Stash complete. You&apos;ve got everything, runner.
        </p>
      </div>
    );
  }

  // Missing entire card types
  const types: CardType[] = ["legend", "unit", "gear", "program"];
  for (const type of types) {
    const cardsOfType = allCards.filter((c) => c.card_type === type);
    const ownedOfType = cardsOfType.filter((c) => ownedIds.has(c.id));
    if (cardsOfType.length > 0 && ownedOfType.length === 0) {
      suggestions.push({
        text: `No ${typeNames[type]} yet`,
        href: `/cards?type=${type}`,
        color: colors.cyan,
      });
    }
  }

  // Near-complete rarities (have at least 1, missing 1-2)
  const rarities: CardRarity[] = [
    "common",
    "uncommon",
    "rare",
    "epic",
    "secret",
    "iconic",
    "nova",
  ];
  for (const rarity of rarities) {
    const cardsOfRarity = allCards.filter((c) => c.rarity === rarity);
    const ownedOfRarity = cardsOfRarity.filter((c) => ownedIds.has(c.id));
    const missing = cardsOfRarity.length - ownedOfRarity.length;
    if (ownedOfRarity.length > 0 && missing > 0 && missing <= 2) {
      suggestions.push({
        text: `${missing} away from all ${rarityNames[rarity]}s`,
        href: `/cards?rarity=${rarity}`,
        color: colors.rarity[rarity] ?? colors.light,
      });
    }
  }

  // Missing factions
  const factions = ["red", "blue", "green", "yellow"];
  for (const faction of factions) {
    const cardsOfFaction = allCards.filter((c) => c.color === faction);
    const ownedOfFaction = cardsOfFaction.filter((c) => ownedIds.has(c.id));
    if (cardsOfFaction.length > 0 && ownedOfFaction.length === 0) {
      suggestions.push({
        text: `No ${faction} cards yet`,
        href: `/cards?color=${faction}`,
        color: colors.magenta,
      });
    }
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.slice(0, 4).map((s, i) => (
        <Link
          key={i}
          href={s.href}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border border-cyber-grey bg-cyber-dark hover:border-cyber-yellow/40 transition-colors"
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: s.color }}
          />
          <span className="text-cyber-light/70">{s.text}</span>
        </Link>
      ))}
    </div>
  );
}
