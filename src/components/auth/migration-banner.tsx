"use client";

import { useDeckMigration } from "@/lib/hooks/use-deck-migration";

export function MigrationBanner() {
  const { showPrompt, localDeckCount, migrating, migrateDecks, dismiss } =
    useDeckMigration();

  if (!showPrompt) return null;

  return (
    <div className="bg-cyber-cyan/10 border-b border-cyber-cyan/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <p className="flex-1 text-sm font-mono text-cyber-light/70">
          You have{" "}
          <span className="text-cyber-cyan font-bold">{localDeckCount}</span>{" "}
          local deck{localDeckCount !== 1 ? "s" : ""}. Import{" "}
          {localDeckCount !== 1 ? "them" : "it"} to your account?
        </p>
        <div className="flex gap-2">
          <button
            onClick={migrateDecks}
            disabled={migrating}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-cyber-black bg-cyber-cyan hover:bg-cyber-cyan/80 rounded transition-colors disabled:opacity-50"
          >
            {migrating ? "Importing..." : "Import"}
          </button>
          <button
            onClick={dismiss}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-cyber-light/40 hover:text-cyber-light/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
