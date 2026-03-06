"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocalDecks } from "./use-local-decks";
import { saveCloudDeck } from "@/lib/supabase/deck-service";

const MIGRATION_FLAG = "ripperdeck-migration-done";
const OLD_MIGRATION_FLAG = "cyberpunk-tcg-migration-done";

// Carry over old migration flag
if (typeof window !== "undefined") {
  const oldFlag = localStorage.getItem(OLD_MIGRATION_FLAG);
  if (oldFlag && !localStorage.getItem(MIGRATION_FLAG)) {
    localStorage.setItem(MIGRATION_FLAG, oldFlag);
  }
  if (oldFlag) localStorage.removeItem(OLD_MIGRATION_FLAG);
}

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
      await Promise.all(
        localDecks.map((deck) => saveCloudDeck(supabase, deck, user.id))
      );
      localDecks.forEach((deck) => deleteLocalDeck(deck.id));
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
