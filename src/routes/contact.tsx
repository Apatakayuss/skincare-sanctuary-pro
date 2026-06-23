import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Alluring" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <SiteLayout>
      <div className="container-page py-20 md:py-28 grid md:grid-cols-2 gap-16">
        <div>
          <p className="eyebrow text-gold mb-6">Talk to us</p>
          <h1 className="font-display text-4xl md:text-5xl text-plum leading-tight">We'd love to hear from you.</h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Product questions, routine guidance, order help — our team replies within 24 hours.
          </p>
          <div className="mt-10 space-y-4 text-charcoal">
            <div className="flex items-center gap-3"><Mail size={18} className="text-gold" /> hello@alluring.ng</div>
            <div className="flex items-center gap-3"><Phone size={18} className="text-gold" /> +234 800 123 4567</div>
            <div className="flex items-center gap-3"><MapPin size={18} className="text-gold" /> Lagos · Ibadan · Ilorin</div>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent — we'll be in touch.");
            setForm({ name: "", email: "", message: "" });
          }}
          className="space-y-5"
        >
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Message</span>
            <textarea
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={6}
              maxLength={1000}
              className="w-full border border-border bg-transparent p-3 outline-none focus:border-gold"
            />
          </label>
          <button className="bg-plum text-cream px-8 py-3 text-xs uppercase tracking-widest">Send message</button>
        </form>
      </div>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold"
      />
    </label>
  );
}
