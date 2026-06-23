import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function loadRole(userId: string | undefined) {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  }

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        // defer to avoid auth deadlocks
        setTimeout(() => loadRole(s?.user.id), 0);
      } else if (event === "SIGNED_OUT") {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadRole(data.session?.user.id).finally(() => setLoading(false));
    });

    return () => sub.data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  async function refreshRole() {
    await loadRole(session?.user.id);
  }

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, loading, isAdmin, signOut, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
