"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useAllCards } from "@/lib/cards/cards-provider";
import { getUniqueCards, getPrintings } from "@/data/cards";
import { useStash } from "@/lib/hooks/use-stash";
import { useCards } from "@/lib/hooks/use-cards";
import { FilterSidebar } from "@/components/ui/filter-sidebar";
import { CardDisplay } from "@/components/cards/card-display";
import { StashStats } from "./stash-stats";
import { StashCardOverlay } from "./stash-card-overlay";
import { StashDock } from "./stash-dock";
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
  const [flashCardId, setFlashCardId] = useState<string | null>(null);
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  // For search highlight — only look at unowned cards
  const unownedFiltered = useMemo(
    () => filteredCards.filter((c) => !stash.has(c.id)),
    [filteredCards, stash]
  );

  const handleCardClick = useCallback(
    (card: Card) => {
      setSelectedCardId((prev) => (prev === card.id ? null : card.id));
    },
    []
  );

  const triggerFlash = useCallback((cardId: string) => {
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    setFlashCardId(cardId);
    flashTimeout.current = setTimeout(() => setFlashCardId(null), 800);
  }, []);

  const handleAddCard = useCallback(
    (cardId: string, qty: number) => {
      addCard(cardId, qty);
      setSelectedCardId(null);
      triggerFlash(cardId);
    },
    [addCard, triggerFlash],
  );

  // Highlight the best-match unowned card as the user types
  const searchHighlightId = useMemo(() => {
    if (!filters.search || filters.search.length < 2) return null;
    if (unownedFiltered.length === 0) return null;
    const q = filters.search.toLowerCase();

    const exact = unownedFiltered.find((c) => c.name.toLowerCase() === q);
    if (exact) return exact.id;

    const startsWith = unownedFiltered.filter((c) =>
      c.name.toLowerCase().startsWith(q)
    );
    if (startsWith.length === 1) return startsWith[0].id;
    if (startsWith.length > 1) {
      return startsWith.reduce((a, b) =>
        a.name.length <= b.name.length ? a : b
      ).id;
    }

    const wordStarts = unownedFiltered.filter((c) =>
      c.name.toLowerCase().split(/\s+/).some((w) => w.startsWith(q))
    );
    if (wordStarts.length === 1) return wordStarts[0].id;

    if (unownedFiltered.length === 1) return unownedFiltered[0].id;

    return null;
  }, [filters.search, unownedFiltered]);

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

  const renderCard = (card: Card) => {
    const isSelected = selectedCardId === card.id;
    const qty = stash.get(card.id) ?? 0;
    const isOwned = qty > 0;
    const isHighlighted = !isOwned && card.id === searchHighlightId;

    return (
      <div
        key={card.id}
        className={cn(
          "relative rounded-lg transition-all duration-300",
          !isOwned && !isSelected && !isHighlighted && "opacity-40 grayscale hover:opacity-70 hover:grayscale-0",
          isHighlighted && !isSelected && "opacity-70 grayscale-0 ring-2 ring-cyber-cyan ring-offset-2 ring-offset-cyber-black"
        )}
        onMouseLeave={() => {
          if (isSelected) setSelectedCardId(null);
        }}
      >
        <CardDisplay
          card={card}
          size="sm"
          showQuantity={isOwned && qty > 1 ? qty : undefined}
          onClick={handleCardClick}
        />
        {isSelected && (
          <StashCardOverlay
            quantity={qty}
            printings={getPrintings(card.name, allCardsRaw)}
            onAdd={(printingCardId, pendingQty) => handleAddCard(printingCardId, pendingQty)}
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

      {/* Inline stash dock — collapsible panel */}
      <StashDock
        stash={stash}
        onSetQuantity={setQuantity}
        onRemove={removeCard}
        flashCardId={flashCardId}
      />

      {/* Filter toggle (mobile) + filter sidebar + card grid */}
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
          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredCards.map((card) => renderCard(card))}
            </div>
          ) : (
            <div className="text-center py-16 text-cyber-light/40 font-mono text-sm">
              No cards match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
