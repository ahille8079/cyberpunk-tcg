"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCards } from "@/lib/hooks/use-cards";
import { CardGrid } from "@/components/cards/card-grid";
import { FilterSidebar } from "@/components/ui/filter-sidebar";
import type { CardFilters } from "@/lib/cards/types";

export default function CardsPage() {
  const [filters, setFilters] = useState<CardFilters>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cards = useCards(filters);
  const router = useRouter();

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-cyber-yellow">
              Card Database
            </h1>
            <p className="text-sm text-cyber-light/50 font-mono mt-1">
              {cards.length} cards found
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden px-3 py-1.5 text-xs font-mono border border-cyber-grey rounded text-cyber-light/60 hover:text-cyber-yellow"
          >
            {sidebarOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div
            className={`${
              sidebarOpen ? "block" : "hidden"
            } md:block w-full md:w-64 shrink-0`}
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              className="md:sticky md:top-20"
            />
          </div>

          <div className="flex-1 min-w-0">
            <CardGrid
              cards={cards}
              onCardClick={(card) => router.push(`/cards/${card.id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
