import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SKIN_TYPES, SKIN_GOALS } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", phone: "", skin_type: "" as string, skincare_goals: [] as string[] });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        skin_type: data.skin_type ?? "",
        skincare_goals: data.skincare_goals ?? [],
      });
    });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      skin_type: (profile.skin_type || null) as any,
      skincare_goals: profile.skincare_goals as any,
    });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  }

  function toggleGoal(g: string) {
    setProfile((p) => ({
      ...p,
      skincare_goals: p.skincare_goals.includes(g) ? p.skincare_goals.filter((x) => x !== g) : [...p.skincare_goals, g],
    }));
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-2">Your profile</h1>
      <p className="text-muted-foreground mb-8">Tell us about your skin so we can recommend the right products.</p>
      <form onSubmit={save} className="space-y-6 max-w-lg">
        <Field label="Full name" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
        <Field label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />

        <div>
          <p className="eyebrow text-plum mb-3">Skin type</p>
          <div className="flex flex-wrap gap-2">
            {SKIN_TYPES.map((s) => (
              <button
                type="button"
                key={s.value}
                onClick={() => setProfile({ ...profile, skin_type: profile.skin_type === s.value ? "" : s.value })}
                className={`px-4 py-2 text-xs uppercase tracking-widest border ${profile.skin_type === s.value ? "bg-plum text-cream border-plum" : "border-border text-charcoal"}`}
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
                className={`px-4 py-2 text-xs uppercase tracking-widest border ${profile.skincare_goals.includes(g.value) ? "bg-gold text-plum border-gold" : "border-border text-charcoal"}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <button disabled={busy} className="bg-plum text-cream px-8 py-3 text-xs uppercase tracking-widest disabled:opacity-50">
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
    </label>
  );
}
