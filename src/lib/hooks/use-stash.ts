"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  getStash,
  upsertStashCard,
  removeStashCard,
} from "@/lib/supabase/stash-service";

export function useStash() {
  const { user, supabase } = useAuth();
  const [stash, setStash] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setStash(new Map());
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const cards = await getStash(supabase, user.id);
      const map = new Map<string, number>();
      for (const c of cards) {
        map.set(c.card_id, c.quantity);
      }
      setStash(map);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error("Failed to fetch stash:", msg, err);
      setError("Failed to load your stash.");
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCard = useCallback(
    async (cardId: string, qty = 1) => {
      if (!user) return;
      const current = stash.get(cardId) ?? 0;
      const newQty = current + qty;

      // Optimistic update
      setStash((prev) => new Map(prev).set(cardId, newQty));

      try {
        await upsertStashCard(supabase, user.id, cardId, newQty);
      } catch (err) {
        console.error("Failed to add card:", err);
        // Rollback
        setStash((prev) => {
          const m = new Map(prev);
          if (current === 0) m.delete(cardId);
          else m.set(cardId, current);
          return m;
        });
      }
    },
    [user, supabase, stash]
  );

  const setQuantity = useCallback(
    async (cardId: string, qty: number) => {
      if (!user) return;
      const current = stash.get(cardId) ?? 0;

      // Optimistic update
      setStash((prev) => {
        const m = new Map(prev);
        if (qty <= 0) m.delete(cardId);
        else m.set(cardId, qty);
        return m;
      });

      try {
        if (qty <= 0) {
          await removeStashCard(supabase, user.id, cardId);
        } else {
          await upsertStashCard(supabase, user.id, cardId, qty);
        }
      } catch (err) {
        console.error("Failed to update card quantity:", err);
        // Rollback
        setStash((prev) => {
          const m = new Map(prev);
          if (current === 0) m.delete(cardId);
          else m.set(cardId, current);
          return m;
        });
      }
    },
    [user, supabase, stash]
  );

  const removeCard = useCallback(
    async (cardId: string) => {
      if (!user) return;
      const current = stash.get(cardId) ?? 0;

      // Optimistic update
      setStash((prev) => {
        const m = new Map(prev);
        m.delete(cardId);
        return m;
      });

      try {
        await removeStashCard(supabase, user.id, cardId);
      } catch (err) {
        console.error("Failed to remove card:", err);
        // Rollback
        if (current > 0) {
          setStash((prev) => new Map(prev).set(cardId, current));
        }
      }
    },
    [user, supabase, stash]
  );

  return { stash, isLoading, error, addCard, removeCard, setQuantity, refresh };
}
