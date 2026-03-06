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
          setCards(data as Card[]);
        }
      });
  }, []);

  return <CardsContext value={cards}>{children}</CardsContext>;
}
