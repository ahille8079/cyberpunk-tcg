"use client";

import { useEffect, useRef, useState } from "react";

interface TipJarModalProps {
  open: boolean;
  onClose: () => void;
}

const presets = [
  { amount: 3, label: "Street Kid" },
  { amount: 5, label: "Edgerunner" },
  { amount: 10, label: "Netrunner" },
  { amount: 25, label: "Legend" },
];

export function TipJarModal({ open, onClose }: TipJarModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  async function handleTip(amount: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0"
    >
      <div className="bg-cyber-dark border border-cyber-yellow/40 rounded-lg w-[420px] max-w-[90vw] p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-cyber-light/30 hover:text-cyber-light w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold font-mono text-cyber-yellow tracking-widest mb-4">
          SLIDE SOME EDDIES
        </h2>

        {/* Body copy */}
        <div className="text-sm font-mono text-cyber-light/60 mb-6 space-y-3 leading-relaxed">
          <p>
            RipperDeck is a one-solo operation running out of a basement in Night City.
            No corpo backing. No Arasaka funding. Just one netrunner, a stack of cards,
            and way too much caffeine.
          </p>
          <p>
            Every eddie helps keep the servers from flatlining and the ripperdoc
            patching new chrome onto the site.
          </p>
        </div>

        {/* Preset amounts */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              disabled={loading}
              onClick={() => handleTip(preset.amount)}
              className="group flex flex-col items-center gap-1 px-4 py-3 rounded border border-cyber-cyan/30 hover:border-cyber-yellow/60 bg-cyber-black/50 hover:bg-cyber-yellow/5 transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            >
              <span className="text-lg font-bold font-mono text-cyber-cyan group-hover:text-cyber-yellow transition-colors">
                ${preset.amount}
              </span>
              <span className="text-xs font-mono text-cyber-light/40 uppercase tracking-wider">
                {preset.label}
              </span>
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <p className="text-xs font-mono text-cyber-yellow text-center mb-3 animate-pulse">
            Connecting to payment terminal...
          </p>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-cyber-grey">
          <p className="text-xs font-mono text-cyber-light/25 text-center">
            All eddies go straight to server hosting &amp; dev costs. No middlemen. No fixers taking a cut.
          </p>
        </div>
      </div>
    </dialog>
  );
}
