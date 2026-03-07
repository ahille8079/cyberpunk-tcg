"use client";

import { useState } from "react";
import type { Card } from "@/lib/cards/types";

interface StashCardOverlayProps {
  quantity: number;
  onAdd: (cardId: string, qty: number) => void;
  onRemove: () => void;
  onSetQuantity: (qty: number) => void;
  printings: Card[];
}

export function StashCardOverlay({
  quantity,
  onAdd,
  onRemove,
  onSetQuantity,
  printings,
}: StashCardOverlayProps) {
  const isOwned = quantity > 0;
  const [pendingQty, setPendingQty] = useState(1);
  const [selectedPrintingId, setSelectedPrintingId] = useState(
    printings[0]?.id ?? ""
  );

  const hasPrintings = printings.length > 1;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-cyber-black/85 backdrop-blur-sm rounded-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {isOwned ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => onSetQuantity(Math.max(0, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-base font-mono bg-cyber-grey rounded-lg hover:bg-cyber-magenta/20 hover:text-cyber-magenta transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-mono font-bold text-cyber-yellow min-w-[2ch] text-center">
              {quantity}
            </span>
            <button
              onClick={() => onSetQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-base font-mono bg-cyber-grey rounded-lg hover:bg-cyber-cyan/20 hover:text-cyber-cyan transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={onRemove}
            className="text-xs font-mono text-cyber-light/40 hover:text-cyber-magenta transition-colors"
          >
            Remove
          </button>
        </>
      ) : (
        <>
          {/* Printing selector */}
          {hasPrintings && (
            <div className="flex gap-1.5 mb-3">
              {printings.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrintingId(p.id)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase rounded border transition-colors ${
                    selectedPrintingId === p.id
                      ? p.printing === "foil"
                        ? "border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10"
                        : "border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10"
                      : "border-cyber-grey/60 text-cyber-light/40 hover:border-cyber-light/30"
                  }`}
                >
                  {p.printing}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setPendingQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-base font-mono bg-cyber-grey rounded-lg hover:bg-cyber-magenta/20 hover:text-cyber-magenta transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-mono font-bold text-cyber-cyan min-w-[2ch] text-center">
              {pendingQty}
            </span>
            <button
              onClick={() => setPendingQty((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center text-base font-mono bg-cyber-grey rounded-lg hover:bg-cyber-cyan/20 hover:text-cyber-cyan transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onAdd(selectedPrintingId, pendingQty)}
            className="px-5 py-2.5 text-sm font-mono uppercase tracking-wider bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/20 transition-colors"
          >
            Add to Stash
          </button>
        </>
      )}
    </div>
  );
}
