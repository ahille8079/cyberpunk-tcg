"use client";

import Link from "next/link";
import { useLocalDecks } from "@/lib/hooks/use-local-decks";
import { getCardById } from "@/data/cards";
import { useAllCards } from "@/lib/cards/cards-provider";
import { CyberButton } from "@/components/ui/cyber-button";
import { COLOR_HEX } from "@/lib/utils";

export default function DecksPage() {
  const allCards = useAllCards();
  const { decks, deleteDeck } = useLocalDecks();

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-mono text-cyber-yellow">
              My Decks
            </h1>
            <p className="text-sm text-cyber-light/50 font-mono mt-1">
              {decks.length} deck{decks.length !== 1 ? "s" : ""} saved locally
            </p>
          </div>
          <CyberButton href="/decks/new" variant="primary">
            New Deck
          </CyberButton>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-cyber-light/30 font-mono mb-4">
              No decks yet. Start building!
            </p>
            <CyberButton href="/decks/new" variant="secondary">
              Create Your First Deck
            </CyberButton>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => {
              const legendIds = [
                deck.legend_1_id,
                deck.legend_2_id,
                deck.legend_3_id,
              ].filter(Boolean);
              const legends = legendIds
                .map((id) => getCardById(id!, allCards))
                .filter(Boolean);
              const totalCards = deck.cards.reduce(
                (sum, c) => sum + c.quantity,
                0
              );

              return (
                <div
                  key={deck.id}
                  className="bg-cyber-dark border border-cyber-grey rounded-lg p-4 hover:border-cyber-yellow/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/decks/${deck.id}`}
                      className="flex-1 min-w-0"
                    >
                      <h2 className="text-lg font-bold text-cyber-light hover:text-cyber-yellow transition-colors">
                        {deck.name || "Untitled Deck"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                        {/* Legends */}
                        <div className="flex flex-wrap items-center gap-1">
                          {legends.map((legend) => (
                            <span
                              key={legend!.id}
                              className="text-xs font-mono px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${COLOR_HEX[legend!.color]}20`,
                                color: COLOR_HEX[legend!.color],
                              }}
                            >
                              {legend!.name}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-mono text-cyber-light/30">
                          {totalCards} cards
                        </span>
                      </div>
                    </Link>

                    <button
                      onClick={() => deleteDeck(deck.id)}
                      className="text-xs font-mono text-cyber-light/20 hover:text-cyber-magenta ml-4 px-2 py-2 min-h-[44px] flex items-center"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
