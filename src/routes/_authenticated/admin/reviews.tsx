import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*, product:products(name, slug)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function toggleApprove(id: string, v: boolean) {
    await supabase.from("reviews").update({ is_approved: v }).eq("id", id);
    toast.success(v ? "Approved" : "Hidden");
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }
  async function remove(id: string) {
    await supabase.from("reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-8">Reviews</h1>
      <div className="space-y-4">
        {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
        {reviews.map((r: any) => (
          <div key={r.id} className="border border-border p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{r.product?.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= r.rating ? "fill-gold text-gold" : "text-border"} />)}
                </div>
                {r.title && <p className="font-display text-lg text-plum mt-1">{r.title}</p>}
                <p className="text-sm text-charcoal mt-1">{r.body}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleApprove(r.id, !r.is_approved)} className={`p-2 ${r.is_approved ? "text-gold" : "text-muted-foreground"}`} title={r.is_approved ? "Approved" : "Hidden"}><Check size={16} /></button>
                <button onClick={() => remove(r.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
