import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Alluring" }] }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.navigate({ to: "/account" });
  }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created — welcome.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      router.navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error("Google sign-in failed"); return; }
    if (result.redirected) return;
    router.navigate({ to: "/account" });
  }

  async function forgotPw() {
    if (!email) { toast.error("Enter your email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message); else toast.success("Reset email sent.");
  }

  return (
    <SiteLayout>
      <div className="container-page py-20 max-w-md mx-auto">
        <p className="eyebrow text-gold mb-4 text-center">Account</p>
        <h1 className="font-display text-4xl text-plum text-center">{mode === "signin" ? "Welcome back" : "Create account"}</h1>

        <button onClick={google} className="w-full mt-8 border border-plum text-plum py-3 text-sm uppercase tracking-widest hover:bg-plum hover:text-cream transition">
          Continue with Google
        </button>
        <div className="flex items-center gap-3 my-6 text-xs uppercase tracking-widest text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
            </label>
          )}
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
          </label>
          <button disabled={busy} className="w-full bg-plum text-cream py-3 text-sm uppercase tracking-widest font-semibold mt-4 disabled:opacity-50">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="flex justify-between mt-6 text-xs text-muted-foreground">
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="underline">
            {mode === "signin" ? "Need an account?" : "Already have an account?"}
          </button>
          {mode === "signin" && (
            <button onClick={forgotPw} className="underline">Forgot password?</button>
          )}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-8">
          Prefer not to sign up? You can <Link to="/cart" className="underline">checkout as a guest</Link>.
        </p>
      </div>
    </SiteLayout>
  );
}
