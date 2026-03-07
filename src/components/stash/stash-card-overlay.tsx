"use client";

import { useState } from "react";

interface StashCardOverlayProps {
  quantity: number;
  onAdd: (qty: number) => void;
  onRemove: () => void;
  onSetQuantity: (qty: number) => void;
}

export function StashCardOverlay({
  quantity,
  onAdd,
  onRemove,
  onSetQuantity,
}: StashCardOverlayProps) {
  const isOwned = quantity > 0;
  const [pendingQty, setPendingQty] = useState(1);

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
              className="w-9 h-9 flex items-center justify-center text-sm font-mono bg-cyber-grey rounded hover:bg-cyber-magenta/20 hover:text-cyber-magenta transition-colors"
            >
              -
            </button>
            <span className="text-xl font-mono font-bold text-cyber-yellow min-w-[2ch] text-center">
              {quantity}
            </span>
            <button
              onClick={() => onSetQuantity(quantity + 1)}
              className="w-9 h-9 flex items-center justify-center text-sm font-mono bg-cyber-grey rounded hover:bg-cyber-cyan/20 hover:text-cyber-cyan transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={onRemove}
            className="text-[10px] font-mono text-cyber-light/30 hover:text-cyber-magenta transition-colors"
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setPendingQty((q) => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center text-sm font-mono bg-cyber-grey rounded hover:bg-cyber-magenta/20 hover:text-cyber-magenta transition-colors"
            >
              -
            </button>
            <span className="text-xl font-mono font-bold text-cyber-cyan min-w-[2ch] text-center">
              {pendingQty}
            </span>
            <button
              onClick={() => setPendingQty((q) => q + 1)}
              className="w-9 h-9 flex items-center justify-center text-sm font-mono bg-cyber-grey rounded hover:bg-cyber-cyan/20 hover:text-cyber-cyan transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onAdd(pendingQty)}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan rounded hover:bg-cyber-cyan/20 transition-colors"
          >
            Add to Stash
          </button>
        </>
      )}
    </div>
  );
}
