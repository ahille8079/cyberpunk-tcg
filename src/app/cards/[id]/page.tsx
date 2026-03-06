import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cards, getPrintings, fetchAllCards, fetchCardById } from "@/data/cards";
import { PrintingSelector } from "@/components/cards/printing-selector";
import { COLOR_HEX } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return cards.map((card) => ({ id: card.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = await fetchCardById(id);
  if (!card) return { title: "Card Not Found" };

  return {
    title: card.name,
    description: `${card.name} — ${card.card_type} card for the Cyberpunk 2077 TCG. ${card.ability_text ?? ""}`,
  };
}

const rarityLabels: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  secret: "Secret",
  iconic: "Iconic",
  nova: "Nova",
};

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const allCards = await fetchAllCards();
  const card = allCards.find((c) => c.id === id);
  if (!card) notFound();

  const colorHex = COLOR_HEX[card.color] ?? "#d1d5db";
  const printings = getPrintings(card.name, allCards);

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/cards"
          className="inline-flex items-center gap-1 text-sm font-mono text-cyber-light/50 hover:text-cyber-yellow mb-6"
        >
          ← Back to Cards
        </Link>

        <PrintingSelector currentId={card.id} printings={printings} />

        <div className="bg-cyber-dark border border-cyber-grey rounded-lg overflow-hidden">
          {/* Card header */}
          <div
            className="p-6 border-b border-cyber-grey"
            style={{
              background: `linear-gradient(135deg, ${colorHex}15, transparent)`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-cyber-light">
                  {card.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="text-sm font-mono uppercase px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${colorHex}20`,
                      color: colorHex,
                    }}
                  >
                    {card.card_type}
                  </span>
                  <span
                    className="text-sm font-mono capitalize"
                    style={{ color: colorHex }}
                  >
                    {card.color}
                  </span>
                  <span className="text-sm font-mono text-cyber-light/50">
                    {rarityLabels[card.rarity]}
                  </span>
                  <span className="text-sm font-mono text-cyber-light/30 capitalize">
                    {card.printing}
                  </span>
                </div>
              </div>

              {/* Image placeholder */}
              <div
                className="w-32 h-44 rounded-lg border border-cyber-grey flex items-center justify-center text-5xl opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${colorHex}20, ${colorHex}05)`,
                }}
              >
                {card.card_type === "legend"
                  ? "★"
                  : card.card_type === "unit"
                    ? "⚔"
                    : card.card_type === "gear"
                      ? "⚙"
                      : "◈"}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-cyber-grey">
            {card.eddie_cost > 0 && (
              <div>
                <div className="text-xs font-mono text-cyber-light/40 uppercase">
                  Eddie Cost
                </div>
                <div className="text-xl font-mono text-cyber-yellow">
                  {card.eddie_cost}
                </div>
              </div>
            )}
            {card.ram_cost != null && (
              <div>
                <div className="text-xs font-mono text-cyber-light/40 uppercase">
                  RAM Cost
                </div>
                <div className="text-xl font-mono text-cyber-cyan">
                  {card.ram_cost}
                </div>
              </div>
            )}
            {card.ram_provided != null && (
              <div>
                <div className="text-xs font-mono text-cyber-light/40 uppercase">
                  RAM Provided
                </div>
                <div className="text-xl font-mono text-cyber-cyan">
                  +{card.ram_provided}
                </div>
              </div>
            )}
            {card.power != null && (
              <div>
                <div className="text-xs font-mono text-cyber-light/40 uppercase">
                  Power
                </div>
                <div className="text-xl font-mono text-cyber-magenta">
                  {card.power}
                </div>
              </div>
            )}
          </div>

          {/* Classification */}
          {card.classification.length > 0 && (
            <div className="px-6 pt-4">
              <div className="text-xs font-mono text-cyber-light/40 uppercase mb-1">
                Classification
              </div>
              <div className="flex gap-2">
                {card.classification.map((cls) => (
                  <span
                    key={cls}
                    className="text-xs font-mono px-2 py-1 bg-cyber-grey/50 rounded text-cyber-light/60"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {card.keywords.length > 0 && (
            <div className="px-6 pt-4">
              <div className="text-xs font-mono text-cyber-light/40 uppercase mb-1">
                Keywords
              </div>
              <div className="flex gap-2">
                {card.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs font-mono px-2 py-1 bg-cyber-grey rounded text-cyber-light/80"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ability text */}
          {card.ability_text && (
            <div className="px-6 py-4">
              <h2 className="text-xs font-mono text-cyber-light/40 uppercase mb-2">
                Ability
              </h2>
              <p className="text-cyber-light leading-relaxed">
                {card.ability_text}
              </p>
            </div>
          )}

          {/* Flavor text */}
          {card.flavor_text && (
            <div className="px-6 pb-4">
              <p className="text-sm italic text-cyber-light/40 border-l-2 border-cyber-grey pl-3">
                {card.flavor_text}
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="px-6 py-4 border-t border-cyber-grey flex items-center gap-4 text-xs font-mono text-cyber-light/30">
            <span>Set: {card.set_name} ({card.set_code})</span>
            {card.card_number && <span>#{card.card_number}</span>}
            {card.has_sell_tag && <span className="text-cyber-yellow/50">$ SELL</span>}
            {card.street_cred_requirement != null && (
              <span>Street Cred: {card.street_cred_requirement}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
