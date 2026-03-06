"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocalDecks } from "@/lib/hooks/use-local-decks";
import { useAuth } from "@/lib/auth";
import { getCloudDeck } from "@/lib/supabase/deck-service";
import { useAllCards } from "@/lib/cards/cards-provider";
import { getCardById } from "@/data/cards";
import { validateDeck } from "@/lib/cards/validation";
import { CyberButton } from "@/components/ui/cyber-button";
import { DeckStats } from "@/components/deck-builder/deck-stats";
import { COLOR_HEX } from "@/lib/utils";
import type { Card, Deck } from "@/lib/cards/types";

export default function DeckSummaryPage() {
  const params = useParams();
  const { getDeck } = useLocalDecks();
  const { user, supabase } = useAuth();
  const allCards = useAllCards();
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined);

  useEffect(() => {
    const deckId = params.id as string;

    const localDeck = getDeck(deckId);
    if (localDeck) {
      setDeck(localDeck);
      return;
    }

    if (user) {
      getCloudDeck(supabase, deckId).then((cloudDeck) => {
        setDeck(cloudDeck);
      });
    } else {
      setDeck(null);
    }
  }, [params.id, getDeck, user, supabase]);

  // Resolve legends
  const legends = useMemo(() => {
    if (!deck) return [];
    return [deck.legend_1_id, deck.legend_2_id, deck.legend_3_id]
      .filter((id): id is string => id != null)
      .map((id) => getCardById(id, allCards))
      .filter((c): c is Card => c != null);
  }, [deck, allCards]);

  // Resolve all deck cards with full card data
  const resolvedCards = useMemo(() => {
    if (!deck) return [];
    return deck.cards
      .map((dc) => {
        const card = getCardById(dc.card_id, allCards);
        return card ? { ...card, quantity: dc.quantity } : null;
      })
      .filter((c): c is Card & { quantity: number } => c != null);
  }, [deck, allCards]);

  // Group cards by type
  const groupedByType = useMemo(() => {
    const groups: Record<string, (Card & { quantity: number })[]> = {};
    for (const card of resolvedCards) {
      const type = card.card_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(card);
    }
    // Sort each group by eddie_cost
    for (const cards of Object.values(groups)) {
      cards.sort((a, b) => a.eddie_cost - b.eddie_cost);
    }
    return groups;
  }, [resolvedCards]);

  // Validation
  const validation = useMemo(() => {
    if (!deck) return null;
    return validateDeck(legends, deck.cards, allCards);
  }, [deck, legends, allCards]);

  // Loading state
  if (deck === undefined) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="bg-cyber-dark border border-cyber-grey rounded-lg p-4 animate-pulse h-20 w-64" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen pt-14 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-mono text-cyber-light/50">
          Deck not found
        </h1>
        <CyberButton href="/decks/new" variant="primary">
          Create New Deck
        </CyberButton>
      </div>
    );
  }

  const totalCards = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
  const typeOrder = ["unit", "gear", "program"];

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-cyber-yellow tracking-wide">
              {deck.name || "Untitled Deck"}
            </h1>
            {deck.description && (
              <p className="text-sm font-mono text-cyber-light/50 mt-1">
                {deck.description}
              </p>
            )}
            <p className="text-xs font-mono text-cyber-light/30 mt-2">
              {totalCards} cards &middot; {legends.length} legend
              {legends.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <CyberButton href={`/decks/${deck.id}`} variant="primary">
              Edit Deck
            </CyberButton>
            <CyberButton href="/decks" variant="ghost">
              My Decks
            </CyberButton>
          </div>
        </div>

        {/* Legends */}
        {legends.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyber-light/40 mb-3">
              Legends
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {legends.map((legend) => (
                <div
                  key={legend.id}
                  className="bg-cyber-dark border rounded-lg p-4 flex flex-col items-center text-center"
                  style={{
                    borderColor: `${COLOR_HEX[legend.color] ?? "#1a1a2e"}40`,
                  }}
                >
                  {legend.image_url ? (
                    <img
                      src={legend.image_url}
                      alt={legend.name}
                      className="w-32 h-44 object-cover rounded mb-3"
                    />
                  ) : (
                    <div
                      className="w-32 h-44 rounded mb-3 flex items-center justify-center text-2xl font-bold font-mono"
                      style={{
                        backgroundColor: `${COLOR_HEX[legend.color] ?? "#1a1a2e"}20`,
                        color: COLOR_HEX[legend.color] ?? "#d1d5db",
                      }}
                    >
                      {legend.name[0]}
                    </div>
                  )}
                  <h3
                    className="font-bold font-mono text-sm"
                    style={{ color: COLOR_HEX[legend.color] ?? "#d1d5db" }}
                  >
                    {legend.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase"
                      style={{
                        backgroundColor: `${COLOR_HEX[legend.color] ?? "#1a1a2e"}20`,
                        color: COLOR_HEX[legend.color] ?? "#d1d5db",
                      }}
                    >
                      {legend.color}
                    </span>
                    {legend.ram_provided != null && (
                      <span className="text-[10px] font-mono text-cyber-light/40">
                        {legend.ram_provided} RAM
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats + Card List */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Stats sidebar */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyber-light/40 mb-3">
              Deck Stats
            </h2>
            {validation && <DeckStats validation={validation} />}
          </div>

          {/* Card list by type */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyber-light/40 mb-3">
              Card List
            </h2>
            <div className="space-y-6">
              {typeOrder
                .filter((type) => groupedByType[type]?.length)
                .map((type) => {
                  const cards = groupedByType[type];
                  const typeCount = cards.reduce(
                    (sum, c) => sum + c.quantity,
                    0
                  );
                  return (
                    <div key={type}>
                      <h3 className="text-sm font-mono font-bold text-cyber-light/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="capitalize">{type}s</span>
                        <span className="text-cyber-light/30 text-xs font-normal">
                          ({typeCount})
                        </span>
                      </h3>
                      <div className="space-y-1">
                        {cards.map((card) => (
                          <div
                            key={card.id}
                            className="flex items-center gap-3 px-3 py-2 bg-cyber-dark/50 border border-cyber-grey/50 rounded text-sm font-mono"
                          >
                            <span className="text-cyber-light/40 w-6 text-right">
                              {card.quantity}x
                            </span>
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  COLOR_HEX[card.color] ?? "#d1d5db",
                              }}
                            />
                            <span className="text-cyber-light flex-1 truncate">
                              {card.name}
                            </span>
                            {card.eddie_cost != null && (
                              <span className="text-cyber-yellow/60 text-xs">
                                {card.eddie_cost}E
                              </span>
                            )}
                            {card.ram_cost != null && (
                              <span className="text-cyber-cyan/50 text-xs">
                                {card.ram_cost}R
                              </span>
                            )}
                            {card.power != null && (
                              <span className="text-cyber-magenta/50 text-xs">
                                {card.power}P
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
