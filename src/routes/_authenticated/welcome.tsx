import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";
import { SKIN_TYPES, SKIN_GOALS } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — Alluring" },
      { name: "description", content: "Confirm your account and personalise your skincare recommendations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const emailConfirmed = !!user?.email_confirmed_at || !!(user as any)?.confirmed_at;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [skinType, setSkinType] = useState<string>("");
  const [goals, setGoals] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName((user.user_metadata?.full_name as string) ?? (user.user_metadata?.name as string) ?? "");
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name ?? fullName);
        setPhone(data.phone ?? "");
        setSkinType(data.skin_type ?? "");
        setGoals(data.skincare_goals ?? []);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function toggleGoal(g: string) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  async function resend() {
    if (!user?.email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: window.location.origin + "/welcome" },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("Confirmation email sent — check your inbox.");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName || null,
      phone: phone || null,
      skin_type: (skinType || null) as any,
      skincare_goals: goals as any,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved — welcome to Alluring.");
    router.navigate({ to: "/shop" });
  }

  return (
    <SiteLayout>
      <div className="container-page py-16 md:py-20 max-w-2xl mx-auto">
        <p className="eyebrow text-gold mb-4 text-center">Welcome to Alluring</p>
        <h1 className="font-display text-4xl md:text-5xl text-plum text-center">
          Let's personalise your ritual
        </h1>
        <p className="text-center text-muted-foreground mt-4">
          A few details help us recommend the right products for your skin.
        </p>

        <div className={`mt-8 border p-5 ${emailConfirmed ? "border-border bg-cream/40" : "border-gold bg-gold/10"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-plum mb-1">
                {emailConfirmed ? "Email confirmed" : "Confirm your email"}
              </p>
              <p className="text-sm text-charcoal">
                {emailConfirmed
                  ? `You're verified as ${user?.email}.`
                  : `We sent a confirmation link to ${user?.email}. Click it to secure your account.`}
              </p>
            </div>
            {!emailConfirmed && (
              <button
                type="button"
                onClick={resend}
                disabled={resending}
                className="shrink-0 border border-plum text-plum px-4 py-2 text-xs uppercase tracking-widest hover:bg-plum hover:text-cream transition disabled:opacity-50"
              >
                {resending ? "Sending…" : "Resend"}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={save} className="mt-10 space-y-6">
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Phone (for delivery updates)</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold"
            />
          </label>

          <div>
            <p className="eyebrow text-plum mb-3">Skin type</p>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => setSkinType(skinType === s.value ? "" : s.value)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border ${skinType === s.value ? "bg-plum text-cream border-plum" : "border-border text-charcoal"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow text-plum mb-3">Skincare goals</p>
            <div className="flex flex-wrap gap-2">
              {SKIN_GOALS.map((g) => (
                <button
                  type="button"
                  key={g.value}
                  onClick={() => toggleGoal(g.value)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border ${goals.includes(g.value) ? "bg-gold text-plum border-gold" : "border-border text-charcoal"}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              disabled={busy}
              className="bg-plum text-cream px-8 py-3 text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save & continue"}
            </button>
            <Link to="/shop" className="text-xs uppercase tracking-widest text-muted-foreground underline">
              Skip for now
            </Link>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
