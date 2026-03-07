"use client";

import { useState } from "react";
import { cn, COLOR_HEX } from "@/lib/utils";
import { colors } from "@/lib/design-tokens";
import type { Card } from "@/lib/cards/types";

interface CardDisplayProps {
  card: Card;
  size?: "sm" | "md" | "lg";
  onClick?: (card: Card) => void;
  showQuantity?: number;
  interactive?: boolean;
}

const typeIcons: Record<string, string> = {
  legend: "\u2605",
  unit: "\u2694",
  gear: "\u2699",
  program: "\u25C8",
};

const rarityColors = colors.rarity;

export function CardDisplay({
  card,
  size = "md",
  onClick,
  showQuantity,
  interactive = true,
}: CardDisplayProps) {
  const colorHex = COLOR_HEX[card.color] ?? "#d1d5db";
  const [imgError, setImgError] = useState(false);

  return (
    <div
      data-testid={`card-${card.id}`}
      onClick={() => onClick?.(card)}
      className={cn(
        "relative flex flex-col rounded-lg border border-cyber-grey bg-cyber-dark overflow-hidden transition-all duration-200 group",
        interactive && "cursor-pointer hover:scale-[1.02]",
        size === "lg" && "text-base"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: colorHex,
      }}
      onMouseEnter={(e) => {
        if (interactive) {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${colorHex}40, 0 0 16px ${colorHex}20`;
        }
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }
      }}
    >
      {/* Card image / placeholder */}
      <div
        className={cn(
          "w-full relative shrink-0",
          size === "sm" ? "aspect-[5/3]" : size === "md" ? "aspect-[4/3]" : "aspect-[3/2]"
        )}
        style={{
          background: `linear-gradient(135deg, ${colorHex}20, ${colorHex}05)`,
        }}
      >
        {card.image_url && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image_url}
            alt={card.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
            <div
              className="text-3xl"
              style={{ color: `${colorHex}40` }}
            >
              {typeIcons[card.card_type] ?? "?"}
            </div>
          </div>
        )}
      </div>

      {/* Cost strip — sits between image and card info, always readable */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-cyber-black/90 border-b border-cyber-grey/40">
        {card.ram_cost != null && (
          <span className={cn(
            "font-mono font-bold text-cyber-cyan",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            {card.ram_cost}R
          </span>
        )}
        {card.eddie_cost > 0 && (
          <span className={cn(
            "font-mono font-bold text-cyber-yellow",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            {card.eddie_cost}E
          </span>
        )}
        {showQuantity != null && showQuantity > 1 && (
          <span className={cn(
            "font-mono font-bold text-cyber-magenta ml-auto",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            x{showQuantity}
          </span>
        )}
        {/* Rarity dot — far right */}
        <span
          className={cn(
            "rounded-full shrink-0",
            showQuantity == null || showQuantity <= 1 ? "ml-auto" : "",
            size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5"
          )}
          style={{ backgroundColor: rarityColors[card.rarity] }}
          title={card.rarity}
        />
      </div>

      {/* Card info */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0",
        size === "sm" ? "p-2" : "p-2.5"
      )}>
        {/* Name + type */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3
            className={cn(
              "font-bold text-cyber-light leading-tight",
              size === "sm" ? "text-sm" : "text-base"
            )}
          >
            {card.name}
          </h3>
          <span
            className={cn(
              "shrink-0 font-mono uppercase rounded",
              size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-xs px-1.5 py-0.5"
            )}
            style={{
              backgroundColor: `${colorHex}20`,
              color: colorHex,
            }}
          >
            {card.card_type}
          </span>
        </div>

        {/* Power + RAM provided */}
        <div className="flex items-center gap-2 mb-1.5">
          {card.power != null && (
            <span className={cn(
              "font-mono text-cyber-light/80",
              size === "sm" ? "text-xs" : "text-sm"
            )}>
              PWR {card.power}
            </span>
          )}
          {card.ram_provided != null && (
            <span className={cn(
              "font-mono text-cyber-cyan",
              size === "sm" ? "text-xs" : "text-sm"
            )}>
              +{card.ram_provided} RAM
            </span>
          )}
        </div>

        {/* Classification */}
        {card.classification.length > 0 && size !== "sm" && (
          <div className="text-xs font-mono text-cyber-light/50 mb-1">
            {card.classification.join(" \u00B7 ")}
          </div>
        )}

        {/* Keywords */}
        {card.keywords.length > 0 && size !== "sm" && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {card.keywords.map((kw) => (
              <span
                key={kw}
                className="text-xs font-mono px-1.5 py-0.5 bg-cyber-grey rounded text-cyber-light/70"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Ability text */}
        {card.ability_text && size !== "sm" && (
          <p
            className={cn(
              "text-cyber-light/60 leading-snug mt-auto",
              size === "md" ? "text-sm line-clamp-3" : "text-base"
            )}
          >
            {card.ability_text}
          </p>
        )}

        {/* Sell tag indicator */}
        {card.has_sell_tag && (
          <div className={cn(
            "font-mono text-cyber-yellow/60",
            size === "sm" ? "text-xs" : "text-sm",
            card.ability_text && size !== "sm" ? "mt-1" : "mt-auto"
          )}>
            $ SELL
          </div>
        )}
      </div>
    </div>
  );
}
