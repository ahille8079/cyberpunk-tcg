"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const providers = [
  {
    id: "discord" as const,
    label: "Discord",
    color: "#5865F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
  },
];

export function AuthModal({ open, onClose, message }: AuthModalProps) {
  const { signInWithOAuth } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0"
    >
      <div className="bg-cyber-dark border border-cyber-yellow/40 rounded-lg w-[340px] max-w-[90vw] p-6 relative">
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
        <h2 className="text-xl font-bold font-mono text-cyber-yellow tracking-widest mb-2">
          JACK IN
        </h2>
        {message && (
          <p className="text-sm font-mono text-cyber-light/50 mb-5">
            {message}
          </p>
        )}
        {!message && (
          <p className="text-sm font-mono text-cyber-light/50 mb-5">
            Jack in with your Discord account
          </p>
        )}

        {/* Provider buttons */}
        <div className="space-y-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => signInWithOAuth(provider.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded font-mono text-sm font-semibold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                backgroundColor: provider.color,
                color: "#ffffff",
              }}
            >
              {provider.icon}
              Continue with {provider.label}
            </button>
          ))}
        </div>

        {/* Divider accent */}
        <div className="mt-5 pt-4 border-t border-cyber-grey">
          <p className="text-xs font-mono text-cyber-light/25 text-center">
            By signing in you agree to the standard terms of net-running
          </p>
        </div>
      </div>
    </dialog>
  );
}
