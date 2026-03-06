"use client";

import { useRouter } from "next/navigation";
import type { Card } from "@/lib/cards/types";
import { cn } from "@/lib/utils";

interface PrintingSelectorProps {
  currentId: string;
  printings: Card[];
}

export function PrintingSelector({ currentId, printings }: PrintingSelectorProps) {
  const router = useRouter();

  if (printings.length <= 1) return null;

  return (
    <div className="mb-4">
      <div className="text-xs font-mono text-cyber-light/40 uppercase mb-2">
        Printings ({printings.length})
      </div>
      <div className="flex flex-wrap gap-2">
        {printings.map((p) => (
          <button
            key={p.id}
            onClick={() => router.push(`/cards/${p.id}`)}
            className={cn(
              "px-3 py-1.5 text-xs font-mono rounded border transition-colors",
              p.id === currentId
                ? "border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow"
                : "border-cyber-grey text-cyber-light/50 hover:border-cyber-light/40 hover:text-cyber-light/70"
            )}
          >
            <span className="capitalize">{p.printing}</span>
            <span className="text-cyber-light/30 ml-1.5">
              {p.set_code} {p.card_number && `#${p.card_number}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
