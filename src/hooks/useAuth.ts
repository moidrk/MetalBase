import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const supabase = createClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setAuthState({
        user: currentSession?.user ?? null,
        session: currentSession,
        isLoading: false,
        isAuthenticated: !!currentSession,
      });
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setAuthState({
        user: currentSession?.user ?? null,
        session: currentSession,
        isLoading: false,
        isAuthenticated: !!currentSession,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
  };
}
