"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Deck } from "@/lib/cards/types";

const STORAGE_KEY = "ripperdeck-decks";
const OLD_STORAGE_KEY = "cyberpunk-tcg-decks";

// One-time migration from old storage key
if (typeof window !== "undefined") {
  const old = localStorage.getItem(OLD_STORAGE_KEY);
  if (old && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, old);
  }
  if (old) localStorage.removeItem(OLD_STORAGE_KEY);
}

let cachedDecks: Deck[] = [];
let cachedRaw: string | null = null;

function getSnapshot(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedDecks = raw ? JSON.parse(raw) : [];
    }
    return cachedDecks;
  } catch {
    return cachedDecks;
  }
}

const SERVER_SNAPSHOT: Deck[] = [];
function getServerSnapshot(): Deck[] {
  return SERVER_SNAPSHOT;
}

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function useLocalDecks() {
  const decks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveDeck = useCallback((deck: Deck) => {
    const current = getSnapshot();
    const existing = current.findIndex((d) => d.id === deck.id);
    const updated =
      existing >= 0
        ? current.map((d) => (d.id === deck.id ? { ...deck, updated_at: new Date().toISOString() } : d))
        : [...current, { ...deck, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitChange();
  }, []);

  const deleteDeck = useCallback((id: string) => {
    const current = getSnapshot();
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitChange();
  }, []);

  const getDeck = useCallback(
    (id: string) => {
      return decks.find((d) => d.id === id);
    },
    [decks]
  );

  return { decks, saveDeck, deleteDeck, getDeck };
}
