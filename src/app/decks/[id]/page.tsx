"use client";

import { useParams } from "next/navigation";
import { useLocalDecks } from "@/lib/hooks/use-local-decks";
import { DeckEditor } from "@/components/deck-builder/deck-editor";
import { CyberButton } from "@/components/ui/cyber-button";

export default function DeckEditPage() {
  const params = useParams();
  const { getDeck } = useLocalDecks();
  const deck = getDeck(params.id as string);

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
