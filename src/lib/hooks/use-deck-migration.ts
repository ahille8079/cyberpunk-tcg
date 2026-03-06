"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocalDecks } from "./use-local-decks";
import { saveCloudDeck } from "@/lib/supabase/deck-service";

const MIGRATION_FLAG = "cyberpunk-tcg-migration-done";

export function useDeckMigration() {
  const { user, supabase } = useAuth();
  const { decks: localDecks, deleteDeck: deleteLocalDeck } = useLocalDecks();
  const [showPrompt, setShowPrompt] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    if (
      user &&
      localDecks.length > 0 &&
      !localStorage.getItem(MIGRATION_FLAG)
    ) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [user, localDecks.length]);

  const migrateDecks = useCallback(async () => {
    if (!user) return;
    setMigrating(true);
    try {
      for (const deck of localDecks) {
        await saveCloudDeck(supabase, deck, user.id);
        deleteLocalDeck(deck.id);
      }
      localStorage.setItem(MIGRATION_FLAG, "true");
      setShowPrompt(false);
    } catch (err) {
      console.error("Migration failed:", err);
    } finally {
      setMigrating(false);
    }
  }, [user, supabase, localDecks, deleteLocalDeck]);

  const dismiss = useCallback(() => {
    localStorage.setItem(MIGRATION_FLAG, "true");
    setShowPrompt(false);
  }, []);

  return {
    showPrompt,
    localDeckCount: localDecks.length,
    migrating,
    migrateDecks,
    dismiss,
  };
}
