"use client";

import type { Card } from "@/lib/cards/types";
import { CardDisplay } from "./card-display";
import { cn } from "@/lib/utils";

interface CardGridProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  showQuantities?: Record<string, number>;
  emptyMessage?: string;
  cardSize?: "sm" | "md" | "lg";
  className?: string;
}

export function CardGrid({
  cards,
  onCardClick,
  showQuantities,
  emptyMessage = "No cards found",
  cardSize = "md",
  className,
}: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-cyber-light/40 font-mono text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      data-testid="card-grid"
      className={cn(
        "grid gap-3",
        cardSize === "sm"
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {cards.map((card) => (
        <CardDisplay
          key={card.id}
          card={card}
          size={cardSize}
          onClick={onCardClick}
          showQuantity={showQuantities?.[card.id]}
        />
      ))}
    </div>
  );
}
