import { NeonText } from "@/components/ui/neon-text";
import { CyberButton } from "@/components/ui/cyber-button";

export default function HomePage() {
  return (
    <div className="min-h-screen pt-14">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-cyber-black">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(252,238,9,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(252,238,9,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(252,238,9,0.05) 0%, transparent 70%)",
            }}
          />
          {/* Scanline effect */}
          <div className="scanline-overlay absolute inset-0 opacity-30" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <NeonText
            as="h1"
            color="yellow"
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono leading-tight mb-6 hover:animate-glitch"
          >
            Build Your Crew.
            <br />
            Run Your Gigs.
          </NeonText>

          <p className="text-lg sm:text-xl text-cyber-light/60 mb-10 max-w-xl mx-auto">
            The deckbuilder for the Cyberpunk 2077 Trading Card Game
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CyberButton href="/decks/new" variant="primary" className="text-base px-8 py-4">
              Start Building
            </CyberButton>
            <CyberButton href="/cards" variant="secondary" className="text-base px-8 py-4">
              Browse Cards
            </CyberButton>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "⚔",
              title: "Deck Building",
              desc: "Build decks with 3 Legends and up to 50 cards. Real-time validation ensures your deck is tournament-ready.",
            },
            {
              icon: "◈",
              title: "Card Database",
              desc: "Browse the complete card database with advanced filtering by type, color, cost, rarity, and keywords.",
            },
            {
              icon: "⚡",
              title: "Live Analytics",
              desc: "Track your eddie cost curve, RAM budget, card type distribution, and more as you build.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-cyber-dark border border-cyber-grey rounded-lg hover:border-cyber-yellow/30 transition-colors group"
            >
              <div className="text-3xl mb-4 group-hover:animate-neon-pulse">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold font-mono text-cyber-light mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-cyber-light/50 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
