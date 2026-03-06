"use client";

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
  legend: "★",
  unit: "⚔",
  gear: "⚙",
  program: "◈",
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

  return (
    <div
      onClick={() => onClick?.(card)}
      className={cn(
        "relative rounded-lg border border-cyber-grey bg-cyber-dark overflow-hidden transition-all duration-200 group",
        interactive && "cursor-pointer hover:scale-[1.02]",
        size === "sm" && "text-xs",
        size === "lg" && "text-base"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: colorHex,
        ...(interactive
          ? {}
          : {}),
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
          "w-full relative",
          size === "sm" ? "h-20" : size === "md" ? "h-32" : "h-48"
        )}
        style={{
          background: `linear-gradient(135deg, ${colorHex}20, ${colorHex}05)`,
        }}
      >
        {card.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image_url}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
            {typeIcons[card.card_type] ?? "?"}
          </div>
        )}

        {/* Eddie cost badge */}
        {card.eddie_cost > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-cyber-black/80 border border-cyber-yellow/50 rounded px-1.5 py-0.5 text-xs font-mono text-cyber-yellow">
            {card.eddie_cost}E
          </div>
        )}

        {/* RAM cost badge */}
        {card.ram_cost != null && (
          <div className="absolute top-1.5 left-1.5 bg-cyber-black/80 border border-cyber-cyan/50 rounded px-1.5 py-0.5 text-xs font-mono text-cyber-cyan">
            {card.ram_cost}R
          </div>
        )}

        {/* Quantity badge */}
        {showQuantity != null && showQuantity > 1 && (
          <div className="absolute bottom-1.5 right-1.5 bg-cyber-magenta text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            x{showQuantity}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className={cn("p-2.5", size === "sm" && "p-1.5")}>
        {/* Name + type */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3
            className={cn(
              "font-bold text-cyber-light leading-tight",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {card.name}
          </h3>
          <span
            className="shrink-0 text-[10px] font-mono uppercase px-1 py-0.5 rounded"
            style={{
              backgroundColor: `${colorHex}20`,
              color: colorHex,
            }}
          >
            {card.card_type}
          </span>
        </div>

        {/* Power + rarity */}
        <div className="flex items-center gap-2 mb-1.5">
          {card.power != null && (
            <span className="text-xs font-mono text-cyber-light/80">
              PWR {card.power}
            </span>
          )}
          {card.ram_provided != null && (
            <span className="text-xs font-mono text-cyber-cyan">
              +{card.ram_provided} RAM
            </span>
          )}
          <span
            className="w-2 h-2 rounded-full ml-auto shrink-0"
            style={{ backgroundColor: rarityColors[card.rarity] }}
            title={card.rarity}
          />
        </div>

        {/* Classification */}
        {card.classification.length > 0 && size !== "sm" && (
          <div className="text-[10px] font-mono text-cyber-light/50 mb-1">
            {card.classification.join(" · ")}
          </div>
        )}

        {/* Keywords */}
        {card.keywords.length > 0 && size !== "sm" && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {card.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-cyber-grey rounded text-cyber-light/70"
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
              "text-cyber-light/60 leading-snug",
              size === "md" ? "text-xs line-clamp-2" : "text-sm"
            )}
          >
            {card.ability_text}
          </p>
        )}

        {/* Sell tag indicator */}
        {card.has_sell_tag && (
          <div className="mt-1 text-[10px] font-mono text-cyber-yellow/60">
            $ SELL
          </div>
        )}
      </div>
    </div>
  );
}
