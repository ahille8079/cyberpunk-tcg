"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocalDecks } from "@/lib/hooks/use-local-decks";
import { useAuth } from "@/lib/auth";
import { getCloudDeck } from "@/lib/supabase/deck-service";
import { DeckEditor } from "@/components/deck-builder/deck-editor";
import { CyberButton } from "@/components/ui/cyber-button";
import type { Deck } from "@/lib/cards/types";

export default function DeckEditPage() {
  const params = useParams();
  const { getDeck } = useLocalDecks();
  const { user, supabase } = useAuth();
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined);

  useEffect(() => {
    const deckId = params.id as string;

    // Check local first
    const localDeck = getDeck(deckId);
    if (localDeck) {
      setDeck(localDeck);
      return;
    }

    // If authenticated, try cloud
    if (user) {
      getCloudDeck(supabase, deckId).then((cloudDeck) => {
        setDeck(cloudDeck);
      });
    } else {
      setDeck(null);
    }
  }, [params.id, getDeck, user, supabase]);

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

  return <DeckEditor initialDeck={deck} />;
}
