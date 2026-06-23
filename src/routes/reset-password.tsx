import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Alluring" }] }),
  component: ResetPage,
});

function ResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated.");
      router.navigate({ to: "/account" });
    }
  }

  return (
    <SiteLayout>
      <div className="container-page py-20 max-w-md mx-auto">
        <h1 className="font-display text-4xl text-plum">Set a new password</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">New password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
          </label>
          <button disabled={busy} className="w-full bg-plum text-cream py-3 text-sm uppercase tracking-widest font-semibold disabled:opacity-50">
            {busy ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
