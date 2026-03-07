"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { StashView } from "@/components/stash/stash-view";
import { triggerGlitchEffect, GLITCH_DURATION } from "@/lib/glitch-effect";

export default function StashPage() {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-mono text-cyber-yellow">
            My Stash
          </h1>
          <p className="text-sm text-cyber-light/50 font-mono mt-1">
            Track the cards you own
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-cyber-dark/50 border border-cyber-grey rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-cyber-dark/50 border border-cyber-grey rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : !user ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-20">🔒</div>
            <p className="text-cyber-light/50 font-mono text-sm mb-4">
              Jack in to start tracking your collection.
            </p>
            <button
              onClick={() => {
                triggerGlitchEffect();
                setTimeout(() => setShowAuthModal(true), GLITCH_DURATION);
              }}
              className="px-6 py-3 text-sm font-mono uppercase tracking-wider text-cyber-cyan border border-cyber-cyan/40 rounded hover:border-cyber-yellow/40 hover:text-cyber-yellow transition-colors"
            >
              Jack In
            </button>
          </div>
        ) : (
          <StashView />
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
