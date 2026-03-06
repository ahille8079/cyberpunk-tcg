"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Card } from "./types";
import { cards as jsonCards } from "@/data/cards";

const CardsContext = createContext<Card[]>(jsonCards);

export function useAllCards(): Card[] {
  return useContext(CardsContext);
}

export function CardsProvider({ children }: { children: ReactNode }) {
  return <CardsContext value={jsonCards}>{children}</CardsContext>;
}
