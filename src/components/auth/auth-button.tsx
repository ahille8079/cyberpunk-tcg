"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth, getDisplayName } from "@/lib/auth";
import { triggerGlitchEffect, GLITCH_DURATION } from "@/lib/glitch-effect";
import { AuthModal } from "./auth-modal";

export function AuthButton() {
  const { user, isLoading, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showDropdown]);

  if (isLoading) {
    return (
      <div className="h-9 w-20 bg-cyber-grey/50 rounded animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => {
            triggerGlitchEffect();
            setTimeout(() => setShowModal(true), GLITCH_DURATION);
          }}
          className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-cyber-cyan hover:text-cyber-yellow transition-colors border border-cyber-cyan/40 hover:border-cyber-yellow/40 rounded min-h-[44px] flex items-center"
        >
          Jack In
        </button>
        <AuthModal open={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  const displayName = getDisplayName(user);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-mono rounded hover:bg-white/5 transition-colors min-h-[44px]"
      >
        {/* Avatar */}
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-cyber-cyan/20 flex items-center justify-center text-cyber-cyan text-xs font-bold">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-cyber-light/80 hidden sm:inline">
          Hey, <span className="text-cyber-cyan">{displayName}</span>
        </span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-cyber-light/40 transition-transform ${showDropdown ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-cyber-dark border border-cyber-grey rounded-lg overflow-hidden shadow-lg shadow-black/50 z-50">
          <Link
            href="/decks"
            onClick={() => setShowDropdown(false)}
            className="block px-4 py-3 text-sm font-mono text-cyber-light/70 hover:text-cyber-light hover:bg-white/5 transition-colors"
          >
            My Decks
          </Link>
          <button
            onClick={() => {
              setShowDropdown(false);
              signOut();
            }}
            className="w-full text-left px-4 py-3 text-sm font-mono text-cyber-light/40 hover:text-cyber-magenta hover:bg-white/5 transition-colors border-t border-cyber-grey"
          >
            Jack Out
          </button>
        </div>
      )}
    </div>
  );
}
