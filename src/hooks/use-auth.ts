import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

async function checkAdmin(userId: string, retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!error) return !!data;
    // Retry on transient clock-skew / JWT-not-yet-valid errors
    const msg = (error as { message?: string; code?: string }).message ?? "";
    const code = (error as { code?: string }).code ?? "";
    if (code === "PGRST303" || /JWT issued at future|not yet valid/i.test(msg)) {
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      continue;
    }
    return false;
  }
  return false;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const uid = s.user.id;
        setTimeout(async () => {
          const admin = await checkAdmin(uid);
          setIsAdmin(admin);
          setLoading(false);
        }, 0);
      } else {
        setIsAdmin(false);
        if (initialized.current) setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const admin = await checkAdmin(s.user.id);
        setIsAdmin(admin);
      }
      setLoading(false);
      initialized.current = true;
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, isAdmin, loading };
}
