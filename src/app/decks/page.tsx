"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocalDecks } from "@/lib/hooks/use-local-decks";
import { useAuth } from "@/lib/auth";
import { getCloudDecks, deleteCloudDeck } from "@/lib/supabase/deck-service";
import { getCardById } from "@/data/cards";
import { useAllCards } from "@/lib/cards/cards-provider";
import { CyberButton } from "@/components/ui/cyber-button";
import { AuthModal } from "@/components/auth/auth-modal";
import { COLOR_HEX } from "@/lib/utils";
import type { Deck } from "@/lib/cards/types";

function DeckCard({
  deck,
  allCards,
  onDelete,
  source,
}: {
  deck: Deck;
  allCards: ReturnType<typeof useAllCards>;
  onDelete: () => void;
  source: "cloud" | "local";
}) {
  const legendIds = [
    deck.legend_1_id,
    deck.legend_2_id,
    deck.legend_3_id,
  ].filter(Boolean);
  const legends = legendIds
    .map((id) => getCardById(id!, allCards))
    .filter(Boolean);
  const totalCards = deck.cards.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="bg-cyber-dark border border-cyber-grey rounded-lg p-4 hover:border-cyber-yellow/30 transition-colors">
      <div className="flex items-start justify-between">
        <Link href={`/decks/${deck.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-cyber-light hover:text-cyber-yellow transition-colors">
              {deck.name || "Untitled Deck"}
            </h2>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                source === "cloud"
                  ? "text-cyber-cyan/60 bg-cyber-cyan/10"
                  : "text-cyber-light/30 bg-cyber-light/5"
              }`}
            >
              {source === "cloud" ? "cloud" : "local"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
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
          onClick={onDelete}
          className="text-xs font-mono text-cyber-light/20 hover:text-cyber-magenta ml-4 px-2 py-2 min-h-[44px] flex items-center"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function DecksPage() {
  const allCards = useAllCards();
  const { decks: localDecks, deleteDeck: deleteLocalDeck } = useLocalDecks();
  const { user, supabase, isLoading: authLoading } = useAuth();
  const [cloudDecks, setCloudDecks] = useState<Deck[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchCloudDecks = useCallback(async () => {
    if (!user) return;
    setLoadingCloud(true);
    try {
      const decks = await getCloudDecks(supabase, user.id);
      setCloudDecks(decks);
    } catch (err) {
      console.error("Failed to fetch cloud decks:", err);
    } finally {
      setLoadingCloud(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchCloudDecks();
  }, [fetchCloudDecks]);

  const handleDeleteCloud = async (deckId: string) => {
    try {
      await deleteCloudDeck(supabase, deckId);
      setCloudDecks((prev) => prev.filter((d) => d.id !== deckId));
    } catch (err) {
      console.error("Failed to delete cloud deck:", err);
    }
  };

  const isAuthenticated = !!user;
  const totalDecks = isAuthenticated
    ? cloudDecks.length + localDecks.length
    : localDecks.length;

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-mono text-cyber-yellow">
              My Decks
            </h1>
            <p className="text-sm text-cyber-light/50 font-mono mt-1">
              {totalDecks} deck{totalDecks !== 1 ? "s" : ""}
              {isAuthenticated ? "" : " saved locally"}
            </p>
          </div>
          <CyberButton href="/decks/new" variant="primary" data-testid="new-deck-btn">
            New Deck
          </CyberButton>
        </div>

        {/* Sign-in banner for unauthenticated users */}
        {!authLoading && !isAuthenticated && (
          <div className="mb-6 p-4 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5">
            <p className="text-sm font-mono text-cyber-light/60">
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-cyber-cyan hover:text-cyber-yellow transition-colors underline underline-offset-2"
              >
                Jack in
              </button>{" "}
              to save your decks and access them anywhere.
            </p>
          </div>
        )}

        {/* Cloud decks */}
        {isAuthenticated && (
          <>
            {loadingCloud ? (
              <div className="space-y-3 mb-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-cyber-dark border border-cyber-grey rounded-lg p-4 animate-pulse h-20"
                  />
                ))}
              </div>
            ) : cloudDecks.length > 0 ? (
              <div className="space-y-3 mb-6">
                {cloudDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    allCards={allCards}
                    onDelete={() => handleDeleteCloud(deck.id)}
                    source="cloud"
                  />
                ))}
              </div>
            ) : null}
          </>
        )}

        {/* Local decks */}
        {localDecks.length > 0 && (
          <>
            {isAuthenticated && (
              <div className="mb-3 mt-6">
                <h2 className="text-sm font-mono uppercase tracking-wider text-cyber-light/30">
                  Local Drafts
                </h2>
              </div>
            )}
            <div className="space-y-3">
              {localDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  allCards={allCards}
                  onDelete={() => deleteLocalDeck(deck.id)}
                  source="local"
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {totalDecks === 0 && !loadingCloud && (
          <div className="text-center py-16">
            <p className="text-cyber-light/30 font-mono mb-4">
              No decks yet. Start building!
            </p>
            <CyberButton href="/decks/new" variant="secondary">
              Create Your First Deck
            </CyberButton>
          </div>
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
