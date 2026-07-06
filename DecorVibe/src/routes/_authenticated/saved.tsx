import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/saved")({
  component: Saved,
  head: () => ({ meta: [{ title: "Saved designs — DecorVibe" }] }),
});

type Design = {
  id: string; original_url: string; generated_url: string; style: string;
  room_type: string; color_theme: string | null; created_at: string;
};

function Saved() {
  const [items, setItems] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Design | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("designs").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const { error } = await supabase.from("designs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Design removed");
    setItems((p) => p.filter((d) => d.id !== id));
    if (active?.id === id) setActive(null);
  };

  const download = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `decorvibe-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl">Your saved designs</h1>
      <p className="mt-2 text-muted-foreground">Tap any design to open the before/after view.</p>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0,1,2,3].map(i => <div key={i} className="h-60 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Nothing saved yet.</p>
          <Button asChild className="mt-4 rounded-full"><Link to="/studio">Create your first design</Link></Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d) => (
              <div key={d.id} className="hover-lift group overflow-hidden rounded-2xl border border-border bg-card">
                <button className="block w-full" onClick={() => setActive(d)}>
                  <img src={d.generated_url} alt={d.style} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                </button>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-serif">{d.style}</p>
                    <p className="text-xs capitalize text-muted-foreground">{d.room_type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => download(d.generated_url)} aria-label="Download"><Download className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(d.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {active && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur" onClick={() => setActive(null)}>
              <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <BeforeAfterSlider before={active.original_url} after={active.generated_url} className="aspect-[4/3]" />
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                  <Button onClick={() => download(active.generated_url)}><Download className="mr-2 h-4 w-4" /> Download</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
