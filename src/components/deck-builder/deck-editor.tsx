"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAllCards } from "@/lib/cards/cards-provider";
import type { Card, CardFilters, Deck, DeckCard } from "@/lib/cards/types";
import { validateDeck } from "@/lib/cards/validation";
import { useLocalDecks } from "@/lib/hooks/use-local-decks";
import { useCards } from "@/lib/hooks/use-cards";
import { useAuth } from "@/lib/auth";
import { saveCloudDeck, DeckLimitError } from "@/lib/supabase/deck-service";
import { triggerGlitchEffect, GLITCH_DURATION } from "@/lib/glitch-effect";
import { MAX_COPIES, COLOR_HEX, DECK_MIN_CARDS, DECK_MAX_CARDS } from "@/lib/utils";
import { CardGrid } from "@/components/cards/card-grid";
import { FilterSidebar } from "@/components/ui/filter-sidebar";
import { AuthModal } from "@/components/auth/auth-modal";
import { LegendPicker } from "./legend-picker";
import { DeckCardList } from "./deck-card-list";
import { DeckStats } from "./deck-stats";
import { EconomyTimeline } from "./economy-timeline";
import { CyberButton } from "@/components/ui/cyber-button";

// State
interface DeckState {
  id: string;
  name: string;
  description: string;
  legends: Card[];
  cards: DeckCard[];
}

type DeckAction =
  | { type: "SET_NAME"; name: string }
  | { type: "SET_DESCRIPTION"; description: string }
  | { type: "TOGGLE_LEGEND"; card: Card }
  | { type: "ADD_CARD"; card: Card }
  | { type: "REMOVE_CARD"; cardId: string }
  | { type: "SET_QUANTITY"; cardId: string; quantity: number }
  | { type: "LOAD_DECK"; deck: DeckState }
  | { type: "CLEAR" };

function deckReducer(state: DeckState, action: DeckAction): DeckState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.name };
    case "SET_DESCRIPTION":
      return { ...state, description: action.description };
    case "TOGGLE_LEGEND": {
      const exists = state.legends.find((l) => l.id === action.card.id);
      if (exists) {
        return {
          ...state,
          legends: state.legends.filter((l) => l.id !== action.card.id),
        };
      }
      if (state.legends.length >= 3) return state;
      // Enforce unique legend names (different printings share the same name)
      if (state.legends.some((l) => l.name === action.card.name)) return state;
      return { ...state, legends: [...state.legends, action.card] };
    }
    case "ADD_CARD": {
      const existing = state.cards.find(
        (c) => c.card_id === action.card.id
      );
      if (existing) {
        if (existing.quantity >= MAX_COPIES) return state;
        return {
          ...state,
          cards: state.cards.map((c) =>
            c.card_id === action.card.id
              ? { ...c, quantity: c.quantity + 1 }
              : c
          ),
        };
      }
      return {
        ...state,
        cards: [...state.cards, { card_id: action.card.id, quantity: 1 }],
      };
    }
    case "REMOVE_CARD":
      return {
        ...state,
        cards: state.cards.filter((c) => c.card_id !== action.cardId),
      };
    case "SET_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          cards: state.cards.filter((c) => c.card_id !== action.cardId),
        };
      }
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.card_id === action.cardId
            ? { ...c, quantity: Math.min(action.quantity, MAX_COPIES) }
            : c
        ),
      };
    }
    case "LOAD_DECK":
      return action.deck;
    case "CLEAR":
      return createInitialState();
    default:
      return state;
  }
}

function createInitialState(): DeckState {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    legends: [],
    cards: [],
  };
}

interface DeckEditorProps {
  initialDeck?: Deck;
}

type MobileTab = "legends" | "cards" | "deck";

export function DeckEditor({ initialDeck }: DeckEditorProps) {
  const allCards = useAllCards();
  const [state, dispatch] = useReducer(deckReducer, null, () => {
    if (initialDeck) {
      const legends = [
        initialDeck.legend_1_id,
        initialDeck.legend_2_id,
        initialDeck.legend_3_id,
      ]
        .filter((id): id is string => id != null)
        .map((id) => allCards.find((c) => c.id === id))
        .filter((c): c is Card => c != null);

      return {
        id: initialDeck.id,
        name: initialDeck.name,
        description: initialDeck.description ?? "",
        legends,
        cards: initialDeck.cards,
      };
    }
    return createInitialState();
  });

  const [filters, setFilters] = useState<CardFilters>({});
  const [mobileTab, setMobileTab] = useState<MobileTab>("cards");
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingSave = useRef(false);
  const { saveDeck: saveLocalDeck } = useLocalDecks();
  const { user, supabase } = useAuth();

  // Filter to non-legend cards
  const nonLegendFilters = useMemo(
    () => ({ ...filters, card_type: filters.card_type ?? undefined }),
    [filters]
  );
  const filteredCards = useCards(nonLegendFilters).filter(
    (c) => c.card_type !== "legend"
  );

  // Auto-sort cards by legend colors (most-selected color first)
  const sortedCards = useMemo(() => {
    if (state.legends.length === 0) return filteredCards;
    const colorCounts: Record<string, number> = {};
    for (const l of state.legends) {
      colorCounts[l.color] = (colorCounts[l.color] ?? 0) + 1;
    }
    const legendColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color);

    return [...filteredCards].sort((a, b) => {
      const aIdx = legendColors.indexOf(a.color);
      const bIdx = legendColors.indexOf(b.color);
      const aPri = aIdx >= 0 ? aIdx : legendColors.length;
      const bPri = bIdx >= 0 ? bIdx : legendColors.length;
      return aPri - bPri;
    });
  }, [filteredCards, state.legends]);

  // Quantities map for card grid
  const quantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const dc of state.cards) {
      map[dc.card_id] = dc.quantity;
    }
    return map;
  }, [state.cards]);

  // Validation
  const validation = useMemo(
    () => validateDeck(state.legends, state.cards, allCards),
    [state.legends, state.cards]
  );

  const buildDeck = useCallback((): Deck => ({
    id: state.id,
    name: state.name || "Untitled Deck",
    description: state.description || null,
    legend_1_id: state.legends[0]?.id ?? null,
    legend_2_id: state.legends[1]?.id ?? null,
    legend_3_id: state.legends[2]?.id ?? null,
    cards: state.cards,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }), [state]);

  const doCloudSave = useCallback(async (skipGlitch = false) => {
    if (!user) return;
    setSaving(true);
    try {
      const deck = buildDeck();
      await saveCloudDeck(supabase, deck, user.id);
      if (!skipGlitch) triggerGlitchEffect();
      setTimeout(() => {
        router.push(`/decks/${deck.id}/summary`);
      }, skipGlitch ? 0 : 500);
    } catch (err) {
      console.error("Cloud save failed:", err);
      if (err instanceof DeckLimitError) {
        alert(err.message);
        setSaving(false);
        return;
      }
      saveLocalDeck(buildDeck());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setSaving(false);
    }
  }, [user, supabase, buildDeck, saveLocalDeck, router]);

  // Auto-save after auth completes (user clicked save while logged out)
  // Skip glitch since auth already triggered one
  useEffect(() => {
    if (user && pendingSave.current) {
      pendingSave.current = false;
      doCloudSave(true);
    }
  }, [user, doCloudSave]);

  const handleSave = useCallback(() => {
    if (!user) {
      pendingSave.current = true;
      triggerGlitchEffect();
      setTimeout(() => setShowAuthModal(true), GLITCH_DURATION);
      return;
    }
    doCloudSave();
  }, [user, doCloudSave]);

  return (
    <div className="min-h-screen pt-14">
      {/* Top bar */}
      <div className="bg-cyber-dark/50 border-b border-cyber-grey">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <input
            type="text"
            value={state.name}
            onChange={(e) =>
              dispatch({ type: "SET_NAME", name: e.target.value })
            }
            placeholder="Deck Name..."
            data-testid="deck-name-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            className="flex-1 bg-transparent text-lg font-bold text-cyber-light placeholder:text-cyber-light/20 focus:outline-none border-b border-transparent focus:border-cyber-yellow"
          />
          <div className="flex gap-2 sm:gap-4">
            <CyberButton onClick={handleSave} variant="primary" disabled={saving} data-testid="save-deck-btn">
              {saving ? "Saving..." : saved ? "Saved!" : "Save Deck"}
            </CyberButton>
            <CyberButton
              onClick={() => dispatch({ type: "CLEAR" })}
              variant="ghost"
              data-testid="clear-deck-btn"
            >
              Clear
            </CyberButton>
          </div>
        </div>
      </div>

      {/* Stats Dashboard Strip */}
      <div className="bg-cyber-dark/50 border-b border-cyber-grey">
        <div className="max-w-[1600px] mx-auto px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* Total Cards */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-cyber-light/40">Cards</span>
              <span
                className={`text-base font-mono font-bold ${
                  validation.stats.totalCards >= DECK_MIN_CARDS &&
                  validation.stats.totalCards <= DECK_MAX_CARDS
                    ? "text-cyber-cyan"
                    : "text-cyber-magenta"
                }`}
              >
                {validation.stats.totalCards}
              </span>
              <span className="text-xs font-mono text-cyber-light/30">
                /{DECK_MAX_CARDS}
              </span>
            </div>

            {/* RAM Budget inline */}
            {Object.entries(validation.stats.ramBudgetByColor).map(
              ([color, budget]) => (
                <div key={color} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLOR_HEX[color] ?? "#d1d5db" }}
                  />
                  <span
                    className={`text-sm font-mono font-bold ${
                      budget.used > budget.provided
                        ? "text-cyber-magenta"
                        : "text-cyber-light/70"
                    }`}
                  >
                    {budget.used}/{budget.provided}
                  </span>
                </div>
              )
            )}

            {/* Sell Tags */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono uppercase text-cyber-light/40">Sell</span>
              <span
                className={`text-sm font-mono font-bold ${
                  validation.stats.sellTagRatio < 0.25
                    ? "text-cyber-magenta"
                    : validation.stats.sellTagRatio < 0.3
                      ? "text-cyber-yellow"
                      : "text-cyber-light/70"
                }`}
              >
                {Math.round(validation.stats.sellTagRatio * 100)}%
              </span>
            </div>

            {/* Blockers */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono uppercase text-cyber-light/40">Blockers</span>
              <span
                className={`text-sm font-mono font-bold ${
                  validation.stats.blockerCount < 4
                    ? "text-cyber-yellow"
                    : "text-cyber-light/70"
                }`}
              >
                {validation.stats.blockerCount}
              </span>
            </div>

            {/* Errors / Warnings count */}
            {validation.errors.length > 0 && (
              <span className="text-xs font-mono text-cyber-magenta">
                {validation.errors.length} error{validation.errors.length !== 1 ? "s" : ""}
              </span>
            )}
            {validation.warnings.length > 0 && (
              <span className="text-xs font-mono text-cyber-yellow/70">
                {validation.warnings.length} warning{validation.warnings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="lg:hidden flex border-b border-cyber-grey">
        {(
          [
            { key: "legends", label: "Legends" },
            { key: "cards", label: "Cards" },
            { key: "deck", label: "Deck" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key)}
            className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${
              mobileTab === tab.key
                ? "text-cyber-yellow border-b-2 border-cyber-yellow"
                : "text-cyber-light/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3-panel layout */}
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="lg:grid lg:grid-cols-[280px_1fr_320px] lg:gap-4">
          {/* Left: Legend Picker */}
          <div
            className={`${
              mobileTab === "legends" ? "block" : "hidden"
            } lg:block`}
          >
            <div className="sticky top-20">
              <LegendPicker
                selectedLegends={state.legends}
                onToggleLegend={(card) =>
                  dispatch({ type: "TOGGLE_LEGEND", card })
                }
              />
            </div>
          </div>

          {/* Center: Card Browser */}
          <div
            className={`${
              mobileTab === "cards" ? "block" : "hidden"
            } lg:block min-w-0`}
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              className="mb-3"
            />
            <CardGrid
              cards={sortedCards}
              onCardClick={(card) => dispatch({ type: "ADD_CARD", card })}
              showQuantities={quantities}
              cardSize="sm"
              emptyMessage="No cards match your filters"
            />
          </div>

          {/* Right: Deck List + Stats + Economy */}
          <div
            className={`${
              mobileTab === "deck" ? "block" : "hidden"
            } lg:block`}
          >
            <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <DeckCardList
                legends={state.legends}
                deckCards={state.cards}
                allCards={allCards}
                onRemoveCard={(cardId) =>
                  dispatch({ type: "REMOVE_CARD", cardId })
                }
                onChangeQuantity={(cardId, quantity) =>
                  dispatch({ type: "SET_QUANTITY", cardId, quantity })
                }
                onRemoveLegend={(cardId) => {
                  const legend = state.legends.find((l) => l.id === cardId);
                  if (legend) dispatch({ type: "TOGGLE_LEGEND", card: legend });
                }}
                onRequestLegendPick={() => setMobileTab("legends")}
              />
              <EconomyTimeline
                deckCards={state.cards}
                allCards={allCards}
                legendCount={state.legends.length}
              />
              <DeckStats validation={validation} />
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          pendingSave.current = false;
        }}
        message="Jack in to save your deck to the cloud"
      />
    </div>
  );
}
