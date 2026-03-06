"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { triggerGlitchEffect } from "@/lib/glitch-effect";

type OAuthProvider = "discord";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  supabase: SupabaseClient;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let initialLoad = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      // Mark initial load complete after a tick so the
      // onAuthStateChange listener can distinguish fresh sign-ins
      // from session restoration on page reload.
      setTimeout(() => { initialLoad = false; }, 500);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      // Only trigger glitch on fresh sign-ins, not session restoration
      if (event === "SIGNED_IN" && !initialLoad) {
        setTimeout(() => triggerGlitchEffect(), 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithOAuth = useCallback(
    async (provider: OAuthProvider) => {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "none",
          },
        },
      });
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, supabase, signInWithOAuth, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

/** Extract a display name from the user's OAuth metadata. */
export function getDisplayName(user: User): string {
  const meta = user.user_metadata;
  return (
    meta?.full_name ||
    meta?.name ||
    meta?.preferred_username ||
    meta?.user_name ||
    user.email?.split("@")[0] ||
    "Runner"
  );
}
