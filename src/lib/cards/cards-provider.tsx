"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Card } from "./types";
import { supabase } from "@/lib/supabase";
import { cards as jsonCards } from "@/data/cards";

const CardsContext = createContext<Card[]>(jsonCards);

export function useAllCards(): Card[] {
  return useContext(CardsContext);
}

export function CardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<Card[]>(jsonCards);

  useEffect(() => {
    supabase
      .from("cards")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // Merge: prefer Supabase data but fall back to local JSON image_url
          const localImageMap = new Map(
            jsonCards.map((c) => [c.id, c.image_url])
          );
          const merged = (data as Card[]).map((card) => ({
            ...card,
            image_url: card.image_url ?? localImageMap.get(card.id) ?? null,
          }));
          setCards(merged);
        }
      });
  }, []);

  return <CardsContext value={cards}>{children}</CardsContext>;
}
