"use client";

import { useState, useCallback, useMemo } from "react";
import { useAllCards } from "@/lib/cards/cards-provider";
import { getUniqueCards } from "@/data/cards";
import { useStash } from "@/lib/hooks/use-stash";
import { useCards } from "@/lib/hooks/use-cards";
import { FilterSidebar } from "@/components/ui/filter-sidebar";
import { CardDisplay } from "@/components/cards/card-display";
import { StashStats } from "./stash-stats";
import { StashSuggestions } from "./stash-suggestions";
import { StashCardOverlay } from "./stash-card-overlay";
import { cn } from "@/lib/utils";
import type { Card, CardFilters } from "@/lib/cards/types";

export function StashView() {
  const allCardsRaw = useAllCards();
  const allCards = useMemo(() => getUniqueCards(allCardsRaw), [allCardsRaw]);
  const { stash, isLoading, addCard, removeCard, setQuantity } = useStash();
  const [filters, setFilters] = useState<CardFilters>({});
  const filteredCards = useCards(filters);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const ownedCards = useMemo(
    () => filteredCards.filter((c) => stash.has(c.id)),
    [filteredCards, stash]
  );

  const unownedCards = useMemo(
    () => filteredCards.filter((c) => !stash.has(c.id)),
    [filteredCards, stash]
  );

  const handleCardClick = useCallback(
    (card: Card) => {
      setSelectedCardId((prev) => (prev === card.id ? null : card.id));
    },
    []
  );

  // Highlight the best-match unowned card as the user types
  const searchHighlightId = useMemo(() => {
    if (!filters.search || filters.search.length < 2) return null;
    if (unownedCards.length === 0) return null;
    const q = filters.search.toLowerCase();

    // Priority 1: exact name match
    const exact = unownedCards.find((c) => c.name.toLowerCase() === q);
    if (exact) return exact.id;

    // Priority 2: name starts with the query
    const startsWith = unownedCards.filter((c) =>
      c.name.toLowerCase().startsWith(q)
    );
    if (startsWith.length === 1) return startsWith[0].id;
    // If multiple start with the query, pick the shortest name (most specific)
    if (startsWith.length > 1) {
      return startsWith.reduce((a, b) =>
        a.name.length <= b.name.length ? a : b
      ).id;
    }

    // Priority 3: a word in the name starts with the query
    const wordStarts = unownedCards.filter((c) =>
      c.name.toLowerCase().split(/\s+/).some((w) => w.startsWith(q))
    );
    if (wordStarts.length === 1) return wordStarts[0].id;

    // Priority 4: only one result left from the filter
    if (unownedCards.length === 1) return unownedCards[0].id;

    return null;
  }, [filters.search, unownedCards]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-cyber-dark/50 border border-cyber-grey rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-cyber-dark/50 border border-cyber-grey rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const stashQuantities: Record<string, number> = {};
  for (const [id, qty] of stash) {
    stashQuantities[id] = qty;
  }

  const renderCard = (card: Card, dimmed: boolean) => {
    const isSelected = selectedCardId === card.id;
    const qty = stash.get(card.id) ?? 0;
    const isHighlighted = dimmed && card.id === searchHighlightId;

    return (
      <div
        key={card.id}
        className={cn(
          "relative rounded-lg transition-all duration-300",
          dimmed && !isSelected && !isHighlighted && "opacity-40 grayscale hover:opacity-70 hover:grayscale-0",
          isHighlighted && !isSelected && "opacity-70 grayscale-0 ring-2 ring-cyber-cyan ring-offset-2 ring-offset-cyber-black"
        )}
        onMouseLeave={() => {
          if (isSelected) setSelectedCardId(null);
        }}
      >
        <CardDisplay
          card={card}
          size="sm"
          showQuantity={qty > 1 ? qty : undefined}
          onClick={handleCardClick}
        />
        {isSelected && (
          <StashCardOverlay
            quantity={qty}
            onAdd={(pendingQty) => {
              addCard(card.id, pendingQty);
              setSelectedCardId(null);
            }}
            onRemove={() => {
              removeCard(card.id);
              setSelectedCardId(null);
            }}
            onSetQuantity={(newQty) => {
              setQuantity(card.id, newQty);
              if (newQty <= 0) setSelectedCardId(null);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <StashStats allCards={allCards} stash={stash} />
      <StashSuggestions allCards={allCards} stash={stash} />

      {/* Filter toggle (mobile) + filter sidebar */}
      <div className="lg:flex lg:gap-6">
        <div className="lg:w-64 shrink-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full mb-3 px-3 py-2 text-xs font-mono uppercase tracking-wider border border-cyber-grey rounded text-cyber-light/60 hover:border-cyber-yellow/40 transition-colors"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            className={cn(
              "lg:block lg:sticky lg:top-20",
              showFilters ? "block mb-4" : "hidden"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Owned cards */}
          {ownedCards.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-mono uppercase tracking-wider text-cyber-yellow mb-3">
                In Your Stash
                <span className="text-cyber-light/30 ml-2">
                  {ownedCards.length}
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {ownedCards.map((card) => renderCard(card, false))}
              </div>
            </div>
          )}

          {/* Empty owned state */}
          {ownedCards.length === 0 && stash.size === 0 && (
            <div className="text-center py-12 mb-8">
              <p className="text-cyber-light/30 font-mono text-sm mb-1">
                Your stash is empty.
              </p>
              <p className="text-cyber-light/20 font-mono text-xs">
                Click any card below to start building your collection.
              </p>
            </div>
          )}

          {/* Unowned cards */}
          {unownedCards.length > 0 && (
            <div>
              <h2 className="text-sm font-mono uppercase tracking-wider text-cyber-light/30 mb-3">
                Not in Stash
                <span className="ml-2">{unownedCards.length}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {unownedCards.map((card) => renderCard(card, true))}
              </div>
            </div>
          )}

          {/* No results from filters */}
          {ownedCards.length === 0 &&
            unownedCards.length === 0 &&
            stash.size > 0 && (
              <div className="text-center py-16 text-cyber-light/40 font-mono text-sm">
                No cards match your filters.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
